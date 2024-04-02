import * as settingsRepository from '../repository/settingsRepository.js'

export async function getAllSelectBoxData(slug){
    return await settingsRepository.getSelectBoxData(slug)
}
