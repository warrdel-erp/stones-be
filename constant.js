export const secretKey = 'wardellsolutionprivatelimited'

export const country = ['Vietnam', 'Angola','Brazil','Canada','China','Greece','India','Italy','Norway','Saudi Arabia','South Africa','Spain','Ukraine'];

export const language = ['English', 'French','Spanish','Italian'];

export const supplierType = ['National', 'International'];

export const statusCode = {
    SUCCESS :200,
    CREATED : 201,
    UPDATED : 204,
    NOT_FOUND : 404,
};

export const errorMessage = (status) =>{
    switch(status){
        case 404: return `Not Found`
        default:return `Internal Server Error`
    }
};

export const productKindEnum = ['Stock', 'Non-stock'];

export const productTypeEnum = ['Slab', 'Pavers','Bench','Table','Sink','Mirror'];

export const productCategoryEnum = ['GRANITE', 'LIMESTONE','MARBLE','QUARTZ','QUARTZITE','SOAPSTONE'];

export const productColoursEnum = ['Black', 'Beige','Blue','Dark Blue','Brown','Pink','Gold','Gray','Crimson','Red','Dark Red','Mute Red','White','Yellow','Green','Sea Green','Mute sea green','light Green'];

export const productOriginEnum = ['Vietnam', 'Angola','Brazil','Canada','China','Greece','India','Italy','Norway','Saudi Arabia','South Africa','Spain','Ukraine'];

export const productUomEnum = ['lb', 'in','CF','CM','SF','Kg','SQM','CBM','EA'];

export const productPriceRangeEnum = ['low', 'mid','high','very high'];

export const productAssignedBinEnum = ['A1', 'A2','A3','B1','B2','B3'];
