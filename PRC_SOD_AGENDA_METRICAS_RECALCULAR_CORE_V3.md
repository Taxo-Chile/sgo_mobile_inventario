CREATE DEFINER=`pjara`@`10.3.%.%` PROCEDURE `taxochil_taxo_clientes`.`PRC_SOD_AGENDA_METRICAS_RECALCULAR_CORE_V3`(
    IN p_id_agenda BIGINT,
    IN p_login VARCHAR(255)
)
main: BEGIN

    DECLARE v_id_tienda INT DEFAULT NULL;
    DECLARE v_id_muestra BIGINT DEFAULT NULL;
    DECLARE v_id_kardex BIGINT DEFAULT NULL;

    DECLARE v_codigo_estado VARCHAR(40) DEFAULT NULL;
    DECLARE v_login VARCHAR(255) DEFAULT NULL;

    DECLARE v_sku_muestra INT DEFAULT 0;
    DECLARE v_sku_kardex INT DEFAULT 0;
    DECLARE v_sku_sin_kardex INT DEFAULT 0;
    DECLARE v_sku_contados INT DEFAULT 0;

    DECLARE v_tags_utilizados INT DEFAULT 0;
    DECLARE v_operadores_activos INT DEFAULT 0;
    DECLARE v_pendientes_sync INT DEFAULT 0;

    DECLARE v_diferencia_cantidad DECIMAL(18,3) DEFAULT 0;
    DECLARE v_diferencia_valor DECIMAL(20,2) DEFAULT 0;

    DECLARE v_reconteos_pendientes INT DEFAULT 0;
    DECLARE v_incidencias_abiertas INT DEFAULT 0;

    DECLARE v_porcentaje DECIMAL(6,2) DEFAULT 0;
    DECLARE v_fl_resultados CHAR(1) DEFAULT 'N';

    /*
     * Las tablas temporales son por conexión.
     * Si algo falla, se limpian y se propaga el error original.
     */
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_tag_v3;
        DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_producto_v3;
        RESIGNAL;
    END;


    DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_tag_v3;
    DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_producto_v3;


    /* ============================================================
       1. VALIDACIONES GENERALES
       ============================================================ */

    IF p_id_agenda IS NULL
       OR p_id_agenda <= 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'El id de agenda es obligatorio.';
    END IF;


    SET v_login =
        COALESCE(
            NULLIF(TRIM(p_login), ''),
            'SISTEMA_RECALCULO'
        );


    SELECT
        a.id_tienda,
        ea.codigo_estado
    INTO
        v_id_tienda,
        v_codigo_estado
    FROM sod_ope_agenda AS a
    INNER JOIN sod_ope_estado_agenda AS ea
            ON ea.id_estado_agenda = a.id_estado_agenda
    WHERE a.id_agenda = p_id_agenda
      AND a.fl_activo = 'S'
    LIMIT 1;


    IF v_id_tienda IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'La agenda no existe o esta inactiva.';
    END IF;


    IF v_codigo_estado IN ('CERRADA','SUSPENDIDA') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'No es posible recalcular una agenda cerrada o suspendida.';
    END IF;


    /* ============================================================
       2. RESOLVER MUESTRA ACTIVA
       ============================================================ */

    SELECT
        am.id_muestra
    INTO
        v_id_muestra
    FROM sod_inv_agenda_muestra AS am
    INNER JOIN sod_inv_muestra AS m
            ON m.id_muestra = am.id_muestra
           AND m.fl_activo = 'S'
    WHERE am.id_agenda = p_id_agenda
      AND am.fl_activo = 'S'
    ORDER BY
        am.fecha_hora_asignacion DESC,
        am.id_agenda_muestra DESC
    LIMIT 1;


    IF v_id_muestra IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'La agenda no posee una muestra activa.';
    END IF;


    SELECT COUNT(*)
    INTO v_sku_muestra
    FROM sod_inv_muestra_det AS md
    WHERE md.id_muestra = v_id_muestra
      AND md.fl_activo = 'S';


    IF v_sku_muestra = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'La muestra activa no contiene productos.';
    END IF;


    /* ============================================================
       3. METRICAS FISICAS
       ============================================================ */

    SELECT COUNT(DISTINCT cd.id_producto)
    INTO v_sku_contados
    FROM sod_inv_conteo_det AS cd
    INNER JOIN sod_inv_muestra_det AS md
            ON md.id_muestra = v_id_muestra
           AND md.id_producto = cd.id_producto
           AND md.fl_activo = 'S'
    WHERE cd.id_agenda = p_id_agenda
      AND cd.estado_registro = 'VIGENTE';


    SELECT COUNT(DISTINCT cd.id_tag)
    INTO v_tags_utilizados
    FROM sod_inv_conteo_det AS cd
    INNER JOIN sod_inv_muestra_det AS md
            ON md.id_muestra = v_id_muestra
           AND md.id_producto = cd.id_producto
           AND md.fl_activo = 'S'
    WHERE cd.id_agenda = p_id_agenda
      AND cd.estado_registro = 'VIGENTE';


    /* ============================================================
       4. OPERADORES
       ============================================================ */

    SELECT COUNT(*)
    INTO v_operadores_activos
    FROM (
        SELECT au.login AS login
        FROM sod_ope_agenda_usuario AS au
        WHERE au.id_agenda = p_id_agenda
          AND au.rol_agenda = 'OPERADOR'
          AND au.fl_activo = 'S'
          AND au.fecha_hora_inicio <= NOW()
          AND (
                au.fecha_hora_fin IS NULL
                OR au.fecha_hora_fin >= NOW()
              )

        UNION

        SELECT ut.login AS login
        FROM sod_sec_usuario_tienda AS ut
        INNER JOIN sod_sec_usuario_ext AS u
                ON CONVERT(u.login USING utf8mb4) COLLATE utf8mb4_unicode_ci
                 = CONVERT(ut.login USING utf8mb4) COLLATE utf8mb4_unicode_ci
        WHERE ut.id_tienda = v_id_tienda
          AND ut.estado_asignacion = 'ACTIVA'
          AND ut.fl_activo = 'S'
          AND ut.fecha_inicio_vigencia <= NOW()
          AND (
                ut.fecha_fin_vigencia IS NULL
                OR ut.fecha_fin_vigencia >= NOW()
              )
          AND u.fl_activo = 'S'
          AND (
                u.fecha_inicio_vigencia IS NULL
                OR u.fecha_inicio_vigencia <= NOW()
              )
          AND (
                u.fecha_fin_vigencia IS NULL
                OR u.fecha_fin_vigencia >= NOW()
              )
    ) AS operadores;


    /* ============================================================
       5. SINCRONIZACION / RECONTEOS / INCIDENCIAS
       ============================================================ */

    SELECT COALESCE(SUM(s.registros_error),0)
    INTO v_pendientes_sync
    FROM sod_inv_sincronizacion AS s
    WHERE s.id_agenda = p_id_agenda
      AND s.estado_sincronizacion IN ('INICIADA','PARCIAL','ERROR');


    SELECT COUNT(*)
    INTO v_reconteos_pendientes
    FROM sod_inv_reconteo AS rc
    WHERE rc.id_agenda = p_id_agenda
      AND rc.estado_reconteo IN (
          'SOLICITADO',
          'ASIGNADO',
          'EN_PROCESO',
          'RECIBIDO'
      );


    SELECT COUNT(*)
    INTO v_incidencias_abiertas
    FROM sod_ope_incidencia AS i
    WHERE i.id_agenda = p_id_agenda
      AND i.estado_incidencia IN ('ABIERTA','EN_GESTION');


    SET v_porcentaje =
        CASE
            WHEN v_sku_muestra > 0
                THEN ROUND((v_sku_contados / v_sku_muestra) * 100,2)
            ELSE 0
        END;


    /* ============================================================
       6. RESOLVER KARDEX ACTIVO
       ============================================================ */

    SELECT k.id_kardex
    INTO v_id_kardex
    FROM sod_inv_kardex AS k
    WHERE k.id_agenda = p_id_agenda
      AND k.fl_activo = 'S'
      AND k.estado_kardex IN ('CARGADO','VALIDADO')
    ORDER BY
        k.fecha_hora_carga DESC,
        k.id_kardex DESC
    LIMIT 1;


    IF v_id_kardex IS NOT NULL THEN

        SELECT COUNT(*)
        INTO v_sku_kardex
        FROM sod_inv_kardex_det AS kd
        WHERE kd.id_kardex = v_id_kardex;


        SELECT COUNT(*)
        INTO v_sku_sin_kardex
        FROM sod_inv_muestra_det AS md
        LEFT JOIN sod_inv_kardex_det AS kd
               ON kd.id_kardex = v_id_kardex
              AND kd.id_producto = md.id_producto
        WHERE md.id_muestra = v_id_muestra
          AND md.fl_activo = 'S'
          AND kd.id_producto IS NULL;


        IF v_sku_sin_kardex = 0 THEN
            SET v_fl_resultados = 'S';
        END IF;

    END IF;


    /* ============================================================
       7. RESULTADO CANONICO V3
       ============================================================ */

    IF v_fl_resultados = 'S' THEN

        /*
         * V3:
         * en lugar de materializar las vistas globales, se recorren únicamente
         * los conteos de p_id_agenda y se resuelve en una sola agrupación:
         * C1, C2, Pre Variance y C3 por Producto + TAG.
         */
        CREATE TEMPORARY TABLE tmp_sod_core_fisico_tag_v3 (
            id_agenda BIGINT NOT NULL,
            id_producto BIGINT NOT NULL,
            id_tag BIGINT NOT NULL,

            cantidad_c1 DECIMAL(20,3) NULL,
            fecha_c1 DATETIME(3) NULL,

            cantidad_c2 DECIMAL(20,3) NULL,
            fecha_c2 DATETIME(3) NULL,

            cantidad_pre_variance DECIMAL(20,3) NULL,
            fecha_pre_variance DATETIME(3) NULL,

            cantidad_c3 DECIMAL(20,3) NULL,
            fecha_c3 DATETIME(3) NULL,

            PRIMARY KEY (id_agenda,id_producto,id_tag),
            KEY idx_tmp_sod_core_tag_prod (id_producto,id_tag)
        ) ENGINE=InnoDB;


        INSERT INTO tmp_sod_core_fisico_tag_v3 (
            id_agenda,
            id_producto,
            id_tag,
            cantidad_c1,
            fecha_c1,
            cantidad_c2,
            fecha_c2,
            cantidad_pre_variance,
            fecha_pre_variance,
            cantidad_c3,
            fecha_c3
        )
        SELECT
            cd.id_agenda,
            cd.id_producto,
            cd.id_tag,

            SUM(
                CASE
                    WHEN c.numero_iteracion = 1
                     AND c.tipo_conteo = 'INICIAL'
                    THEN cd.cantidad
                    ELSE NULL
                END
            ) AS cantidad_c1,

            MAX(
                CASE
                    WHEN c.numero_iteracion = 1
                     AND c.tipo_conteo = 'INICIAL'
                    THEN cd.fecha_hora_captura
                    ELSE NULL
                END
            ) AS fecha_c1,

            SUM(
                CASE
                    WHEN c.numero_iteracion = 2
                     AND c.tipo_conteo = 'VALIDACION'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_ANALISTA'
                    THEN cd.cantidad
                    ELSE NULL
                END
            ) AS cantidad_c2,

            MAX(
                CASE
                    WHEN c.numero_iteracion = 2
                     AND c.tipo_conteo = 'VALIDACION'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_ANALISTA'
                    THEN cd.fecha_hora_captura
                    ELSE NULL
                END
            ) AS fecha_c2,

            SUM(
                CASE
                    WHEN c.numero_iteracion = 2
                     AND c.tipo_conteo = 'VALIDACION'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_PREVARIANCE'
                    THEN cd.cantidad
                    ELSE NULL
                END
            ) AS cantidad_pre_variance,

            MAX(
                CASE
                    WHEN c.numero_iteracion = 2
                     AND c.tipo_conteo = 'VALIDACION'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_PREVARIANCE'
                    THEN cd.fecha_hora_captura
                    ELSE NULL
                END
            ) AS fecha_pre_variance,

            SUM(
                CASE
                    WHEN c.numero_iteracion = 3
                     AND c.tipo_conteo = 'RECONTEO'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_RECUENTO'
                    THEN cd.cantidad
                    ELSE NULL
                END
            ) AS cantidad_c3,

            MAX(
                CASE
                    WHEN c.numero_iteracion = 3
                     AND c.tipo_conteo = 'RECONTEO'
                     AND cd.id_reconteo IS NULL
                     AND cd.origen = 'SGO_RECUENTO'
                    THEN cd.fecha_hora_captura
                    ELSE NULL
                END
            ) AS fecha_c3

        FROM sod_inv_conteo AS c

        INNER JOIN sod_inv_conteo_det AS cd
                ON cd.id_conteo = c.id_conteo
               AND cd.id_agenda = c.id_agenda
               AND cd.estado_registro = 'VIGENTE'

        WHERE c.id_agenda = p_id_agenda
          AND c.fl_activo = 'S'
          AND (
                (
                    c.numero_iteracion = 1
                    AND c.tipo_conteo = 'INICIAL'
                )
                OR
                (
                    c.numero_iteracion = 2
                    AND c.tipo_conteo = 'VALIDACION'
                    AND cd.id_reconteo IS NULL
                    AND cd.origen IN ('SGO_ANALISTA','SGO_PREVARIANCE')
                )
                OR
                (
                    c.numero_iteracion = 3
                    AND c.tipo_conteo = 'RECONTEO'
                    AND cd.id_reconteo IS NULL
                    AND cd.origen = 'SGO_RECUENTO'
                )
              )

        GROUP BY
            cd.id_agenda,
            cd.id_producto,
            cd.id_tag;


        CREATE TEMPORARY TABLE tmp_sod_core_fisico_producto_v3 (
            id_producto BIGINT NOT NULL,
            cantidad_final DECIMAL(20,3) NOT NULL,
            PRIMARY KEY (id_producto)
        ) ENGINE=InnoDB;


        INSERT INTO tmp_sod_core_fisico_producto_v3 (
            id_producto,
            cantidad_final
        )
        SELECT
            x.id_producto,

            SUM(
                COALESCE(
                    x.cantidad_c3,
                    x.cantidad_pre_variance,
                    x.cantidad_c2,
                    x.cantidad_c1,
                    0
                )
            ) AS cantidad_final

        FROM tmp_sod_core_fisico_tag_v3 AS x

        INNER JOIN sod_inv_tag AS t
                ON t.id_tag = x.id_tag
               AND t.id_agenda = x.id_agenda

        INNER JOIN sod_cfg_producto AS px
                ON px.id_producto = x.id_producto

        GROUP BY
            x.id_producto;


        INSERT INTO sod_inv_resultado (
            id_agenda,
            id_producto,
            stock_teorico,
            cantidad_conteo,
            cantidad_final,
            diferencia_cantidad,
            valor_unitario,
            diferencia_valor,
            clasificacion,
            fl_producto_critico,
            fl_alto_valor,
            estado_revision,
            fecha_calculo,
            usuario_calculo
        )

        SELECT
            p_id_agenda,
            md.id_producto,
            kd.stock_teorico,

            COALESCE(fv.cantidad_final,0) AS cantidad_conteo,
            COALESCE(fv.cantidad_final,0) AS cantidad_final,

            (
                COALESCE(fv.cantidad_final,0)
                - kd.stock_teorico
            ) AS diferencia_cantidad,

            kd.valor_unitario,

            (
                COALESCE(fv.cantidad_final,0)
                - kd.stock_teorico
            ) * kd.valor_unitario AS diferencia_valor,

            CASE
                WHEN fv.id_producto IS NULL
                    THEN 'NO_CONTADO'
                WHEN COALESCE(fv.cantidad_final,0) = kd.stock_teorico
                    THEN 'COINCIDENTE'
                WHEN COALESCE(fv.cantidad_final,0) < kd.stock_teorico
                    THEN 'FALTANTE'
                ELSE 'SOBRANTE'
            END AS clasificacion,

            p.fl_producto_critico,
            p.fl_alto_valor,

            CASE
                WHEN fv.id_producto IS NULL
                    THEN 'PENDIENTE'
                WHEN COALESCE(fv.cantidad_final,0) = kd.stock_teorico
                    THEN 'RESUELTO'
                ELSE 'PENDIENTE'
            END AS estado_revision,

            NOW(),
            v_login

        FROM sod_inv_muestra_det AS md

        INNER JOIN sod_inv_kardex_det AS kd
                ON kd.id_kardex = v_id_kardex
               AND kd.id_producto = md.id_producto

        INNER JOIN sod_cfg_producto AS p
                ON p.id_producto = md.id_producto
               AND p.fl_activo = 'S'

        LEFT JOIN tmp_sod_core_fisico_producto_v3 AS fv
               ON fv.id_producto = md.id_producto

        WHERE md.id_muestra = v_id_muestra
          AND md.fl_activo = 'S'

        ON DUPLICATE KEY UPDATE

            stock_teorico = VALUES(stock_teorico),
            cantidad_conteo = VALUES(cantidad_conteo),
            cantidad_final = VALUES(cantidad_final),
            diferencia_cantidad = VALUES(diferencia_cantidad),
            valor_unitario = VALUES(valor_unitario),
            diferencia_valor = VALUES(diferencia_valor),
            clasificacion = VALUES(clasificacion),
            fl_producto_critico = VALUES(fl_producto_critico),
            fl_alto_valor = VALUES(fl_alto_valor),
            estado_revision = VALUES(estado_revision),
            fecha_calculo = NOW(),
            usuario_calculo = v_login;


        /* Limpieza de resultados de muestras anteriores. */
        DELETE r
        FROM sod_inv_resultado AS r
        LEFT JOIN sod_inv_muestra_det AS md
               ON md.id_muestra = v_id_muestra
              AND md.id_producto = r.id_producto
              AND md.fl_activo = 'S'
        WHERE r.id_agenda = p_id_agenda
          AND md.id_producto IS NULL;


        SELECT
            COALESCE(SUM(r.diferencia_cantidad),0),
            COALESCE(SUM(r.diferencia_valor),0)
        INTO
            v_diferencia_cantidad,
            v_diferencia_valor
        FROM sod_inv_resultado AS r
        INNER JOIN sod_inv_muestra_det AS md
                ON md.id_muestra = v_id_muestra
               AND md.id_producto = r.id_producto
               AND md.fl_activo = 'S'
        WHERE r.id_agenda = p_id_agenda;

    ELSE

        SET v_diferencia_cantidad = 0;
        SET v_diferencia_valor = 0;

    END IF;


    /* ============================================================
       8. METRICA DE AGENDA
       ============================================================ */

    INSERT INTO sod_ope_agenda_metrica (
        id_agenda,
        porcentaje_avance,
        sku_muestra,
        sku_contados,
        tags_esperados,
        tags_utilizados,
        operadores_activos,
        registros_pendientes_sync,
        diferencia_cantidad,
        diferencia_valor,
        reconteos_pendientes,
        incidencias_abiertas,
        fecha_actualizacion,
        usuario_actualizacion
    )
    VALUES (
        p_id_agenda,
        v_porcentaje,
        v_sku_muestra,
        v_sku_contados,
        0,
        v_tags_utilizados,
        v_operadores_activos,
        v_pendientes_sync,
        v_diferencia_cantidad,
        v_diferencia_valor,
        v_reconteos_pendientes,
        v_incidencias_abiertas,
        NOW(),
        v_login
    )
    ON DUPLICATE KEY UPDATE
        porcentaje_avance = VALUES(porcentaje_avance),
        sku_muestra = VALUES(sku_muestra),
        sku_contados = VALUES(sku_contados),
        tags_esperados = 0,
        tags_utilizados = VALUES(tags_utilizados),
        operadores_activos = VALUES(operadores_activos),
        registros_pendientes_sync = VALUES(registros_pendientes_sync),
        diferencia_cantidad = VALUES(diferencia_cantidad),
        diferencia_valor = VALUES(diferencia_valor),
        reconteos_pendientes = VALUES(reconteos_pendientes),
        incidencias_abiertas = VALUES(incidencias_abiertas),
        fecha_actualizacion = NOW(),
        usuario_actualizacion = v_login;


    DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_tag_v3;
    DROP TEMPORARY TABLE IF EXISTS tmp_sod_core_fisico_producto_v3;

END;