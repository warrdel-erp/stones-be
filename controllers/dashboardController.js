import * as dashboardService  from '../services/dashboardServices.js';
import moment from 'moment';

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

export const getCalenderMonth = async (req, res) => {
    let { fromDate, toDate } = req.query;
  
    // If fromDate or toDate is not provided, use current month's first and last date
    if (!fromDate) {
      fromDate = moment().startOf("month").format("YYYY-MM-DD");
    }

    if (!toDate) {
      toDate = moment().endOf("month").format("YYYY-MM-DD");
    }
  
    try {
      const result = await dashboardService.getCalenderMonth(fromDate, toDate);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getting dashboard Calender Month:", error);
      res.status(500).send("Internal Server Error");
    }
};

export const getCalenderDate = async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).send("Please select the date");
    }
    try {
        const result = await dashboardService.getCalenderDate(date);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getting dashboard Calender Data:", error);
        res.status(500).send("Internal Server Error");
    }
};
