DELIMITER //
CREATE TRIGGER after_accounts_insert
AFTER INSERT ON accounts
FOR EACH ROW
BEGIN
    DECLARE accountTypeID VARCHAR(10);
    DECLARE subAccountTypeID VARCHAR(10);
    DECLARE accountID VARCHAR(10);
    DECLARE coa_code VARCHAR(12);
    DECLARE row_number INT;

    SET @row_number := 0;
    SELECT row_num
    INTO row_number
    FROM (
        SELECT sub_account_types_id, 
               (@row_number := @row_number + 1) AS row_num
        FROM sub_account_types
        WHERE account_types_id = NEW.account_types_id
        ORDER BY sub_account_types_id
    ) AS sub_accounts
    WHERE sub_account_types_id = NEW.sub_account_types_id;
    SET accountTypeID = CONCAT(LPAD(CAST(NEW.account_types_id AS CHAR), 2, '0'));
    SET subAccountTypeID = CONCAT(LPAD(CAST(row_number AS CHAR), 2, '0'));
    SET accountID = CONCAT(LPAD(CAST(NEW.accounts_id AS CHAR), 4, '0'));
    SET coa_code = CONCAT(accountTypeID, subAccountTypeID, accountID);
    UPDATE accounts
    SET coa_code = coa_code
    WHERE accounts_id = NEW.accounts_id;
END //

DELIMITER ;

DELIMITER //

DROP PROCEDURE IF EXISTS update_coa_codes_one_by_one;

CREATE PROCEDURE update_coa_codes_one_by_one()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE var_account_id INT;
    DECLARE var_account_types_id INT;
    DECLARE var_sub_account_types_id INT;
    DECLARE var_coa_code VARCHAR(12);
    DECLARE var_row_number INT;

    DECLARE account_cursor CURSOR FOR
    SELECT accounts_id, account_types_id, sub_account_types_id
    FROM accounts;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN account_cursor;

    read_loop: LOOP
        FETCH account_cursor INTO var_account_id, var_account_types_id, var_sub_account_types_id;

        IF done THEN
            LEAVE read_loop;
        END IF;
        SET @row_number := 0;
        SELECT row_num
        INTO var_row_number
        FROM (
            SELECT sub_account_types_id, 
                   (@row_number := @row_number + 1) AS row_num
            FROM sub_account_types
            WHERE account_types_id = var_account_types_id
            ORDER BY sub_account_types_id
        ) AS sub_accounts
        WHERE sub_account_types_id = var_sub_account_types_id;
        SET var_coa_code = CONCAT(
            LPAD(CAST(var_account_types_id AS CHAR), 2, '0'),
            LPAD(CAST(var_row_number AS CHAR), 2, '0'),
            LPAD(CAST(var_account_id AS CHAR), 4, '0')
        );
        UPDATE accounts
        SET coa_code = var_coa_code
        WHERE accounts_id = var_account_id;
    END LOOP;

    CLOSE account_cursor;
END //

DELIMITER ;
