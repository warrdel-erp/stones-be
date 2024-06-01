import * as settingsRepository from '../repository/settingsRepository.js'

export async function getAllSelectBoxData(settingstype){
    const settings = await settingsRepository.getSelectBoxData(settingstype);
    return settings.map(s => {
        return {
            ...s.dataValues,
            settingValue: typeof s.dataValues.settingValue === 'object' ? s.dataValues.settingValue : JSON.parse(s.dataValues.settingValue)     
        }
    });
}

// location

export async function getLocation(){
    return await settingsRepository.getLocation()
}
