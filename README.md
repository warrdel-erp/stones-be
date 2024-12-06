# stone-crm-be-app

# setup project
checkout project from git@github.com:Warrdel/stone-crm-be-app.git

1. install project dependencies
yarn install

2. run application
nodemon app.js


## steps to setup the database
-- navigate to the root sql folder in which
1. run the stone_design.sql    -- this file have all the tables structure used in this project

below files 2 to 7 have all the master tables data to be inserted, without this some of the functionality will not work 
2. run the stone_design_vendor_sql
3. run the stone_design_sub_account_types.sql
4. run the settings.sql
5. run the permissions.sql
6. run the account_types.sql
7. run the accounts.sql