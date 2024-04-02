import * as settingsRepository from '../repository/settingsRepository.js'

export async function getAllSelectBoxData(settingstype){
    return await settingsRepository.getSelectBoxData(settingstype)
}
