-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: stone_design_second
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'PurchaseOrderRO','Purchaser order view','Purchase','/purchaseOrder/all'),(2,'SupplierRO','Allows the user to view the list of supplier','supplier',NULL),(3,'DashboardRO','Its a dashboardpermission','Dashboard','/dashboard/all'),(206,'DashboardRO','Read-only access to the dashboard','Dashboard','/dashboard/all'),(207,'PurchaseOrderRO','Read-only access to purchase orders','PurchaseOrder','/purchaseOrder/allPo'),(208,'PurchaseOrderRW','Read and write access to purchase orders','PurchaseOrder','/purchaseOrder'),(209,'InventoryListRO','Read-only access to inventory details based on supplier','Inventory','/purchaseOrder/inventoryDetailsBasedOnSipl'),(210,'SalesOrderRO','Read-only access to sales orders','SalesOrder','/salesOrder/allPo'),(211,'SalesOrderRW','Read and write access to sales orders','SalesOrder','/salesOrder'),(212,'ReturnRO','Read-only access to returns','Return','/return/all'),(213,'ReturnRW','Read and write access to return slabs','Return','/return/returnSlabs'),(214,'ProductRO','Read-only access to products','Product','/product/all'),(215,'ProductRW','Read and write access to products','Product','/product'),(216,'CustomerRW','Read and write access to customer data','Customer','/customer'),(217,'CustomerRO','Read-only access to customer data','Customer','/customer/all'),(218,'SupplierRW','Read and write access to supplier data','Supplier','/supplier'),(219,'SupplierRO','Read-only access to supplier data','Supplier','/supplier/all'),(220,'VendorRO','Read-only access to vendor data','Vendor','/vendor/all'),(221,'VendorRW','Read and write access to vendor data','Vendor','/vendor'),(222,'OpportunityRW','Read and write access to opportunities','Opportunity','/opportunity'),(223,'OpportunityRO','Read-only access to opportunities','Opportunity','/opportunity/all'),(224,'OpportunityRW','Read and write access to opportunity selection sheet','Opportunity','/opportunity/selectionSheet'),(225,'OpportunityRO','Read-only access to opportunity details','Opportunity','/opportunity/opportunityDetails'),(226,'OpportunityRO','Read-only access to product inventory in opportunities','Opportunity','/opportunity/getProductInventory'),(227,'OpportunityRO','Read-only access to selection sheet details','Opportunity','/opportunity/selectionSheetDetails'),(228,'AccountRW','Read and write access to accounts','Accounts','/accounts/'),(229,'AccountRO','Read-only access to all accounts','Accounts','/accounts/all'),(230,'AccountRO','Read-only access to all account types','Accounts','/accounts/allTypes'),(231,'AccountRO','Read-only access to cash financial asset list','Accounts','/accounts/cashFinancialAssetList'),(232,'AccountRO','Read-only access to grouped list of accounts','Accounts','/accounts/groupedListAccounts'),(233,'AccountRO','Read-only access to transaction details by chart of accounts','Accounts','/accounts/transactionDetailsCOA'),(234,'AccountRO','Read-only access to account IDs by name','Accounts','/accounts/accountIdsByName');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-05  7:41:58
