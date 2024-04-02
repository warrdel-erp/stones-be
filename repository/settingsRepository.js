import * as model from '../models/index.js'

export async function getSelectBoxData(slug) {
    let result;
    try {
        if(slug !== "all"){
             result = await model.settingModel.findAll({
                where: {
                    setting_type: slug
                }
            });
        }else{
             result = await model.settingModel.findAll();
        }
        return result;
    } catch (error) {
        console.error(`Error in ${slug}:`, error);
        throw error;
    }
}