import * as dashboardService  from '../services/dashboardServices.js';
import moment from 'moment';

// export const getDashBoardData = async (req,res) => {
//     let {fromDate,toDate} = req.query
//     try {
//         const result = await dashboardService.getDashBoardData(fromDate,toDate);
//         res.status(200).json(result);
//     } catch (error) {
//         console.error("Error in getting dashboard Data :", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

export const getDashBoardData = async (req, res) => {
    let { fromDate, toDate } = req.query;

    const today = moment().format('YYYY-MM-DD');
    const tenDaysAgo = moment().subtract(10, 'days').format('YYYY-MM-DD');

    // if fromDate or toDate are not provided
    fromDate = fromDate || tenDaysAgo;
    toDate = toDate || today;

    try {
        const result = await dashboardService.getDashBoardData(fromDate, toDate);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getting dashboard Data:", error);
        res.status(500).send("Internal Server Error");
    }
};