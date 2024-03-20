// import * as productServices from '../services/productServices.js'

// // 1. create product
// export const addProduct = async () => {
//     try {
//         let info = {
//             type: req.body.type,
//             created_By: req.body.created_by , 
//             is_active: req.body.is_active ,
//             reference_id: req.body.reference_id 
//         };
//         const result = await productServices.addProducts(info);
//         res.status(200).send(result);
//     } catch (error) {
//         console.error("Error in addProduct:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };
