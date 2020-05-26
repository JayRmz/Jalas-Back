var validator = require('validator');

exports.isAlphaSpace=function (alpha) {
    var alphaArray=alpha.split(" ");
    var alphaFormat=[];

    let i;
    let string;
    for(i=0;i<alphaArray.length;i++)
    {
        string=stringFormat(alphaArray[i])
        if(validator.isAlpha(string))
            alphaFormat.push(string[0].toUpperCase() + (string.slice(1)).toLowerCase());
        else{
            console.log("isAlphaSpace")
            return false
        }

    }
    return alphaFormat.join(" ")
};

exports.isAlpha=function (alpha) {
    alpha=stringFormat(alpha)
    if(!validator.isAlpha(alpha))
    {
        console.log("isAlpha")
        return false;
    }
    return alpha[0].toUpperCase() + (alpha.slice(1)).toLowerCase()

};

exports.isEmail=function (email) {
    email=stringFormat(validator.normalizeEmail(email));
    console.log(email)
    if(!validator.isEmail(email))
    {
        console.log("isEmail")
        return false;
    }
    return email
};

exports.isDate=function (date) {
    date=stringFormat(date)
    if(!validator.isISO8601(date)) {
        console.log("isDate")
        return false;
    }
    return date
};

exports.isIdArray=function (idArray) {
    let i;
    let id;
    for(i=0;i<idArray.length;i++) {
        id = stringFormat(idArray[i])
        if (!validator.isNumeric(id))
        {
            console.log("isIdArray")
            return false;
        }
    }
    return idArray
};

exports.pass=function (obj) {
    return obj
};

exports.isId=function (id) {
    id=stringFormat(id)
    if(!validator.isNumeric(id))
    {
        console.log("isId")
        return false;
    }
    return id
};

exports.isAlphaNumeric=function (alpha) {
    console.log("isAlphaNumeric")

    alpha=stringFormat(alpha)
    var alphaNumericArray=alpha.split(" ");
    let i;
    let string;
    for(i=0;i<alphaNumericArray.length;i++)
    {
        string=stringFormat(alphaNumericArray[i])
        if(!validator.isAlphanumeric(string))
        {
            console.log("isAlphaNumeric")
            return false;
        }
    }
    return alpha
};

exports.isFloat=function (number) {
    number=stringFormat(number)
    if (!validator.isFloat(number))
    {
        console.log("isFloat")
        return false;
    }
    return number
};

exports.isInteger=function (id) {
    id=stringFormat(id)
    if(!validator.isNumeric(id))
    {
        console.log("isInteger")
        return false;
    }
    return id
};

exports.escape=function (string) {
    string=stringFormat(string)
    return validator.escape(string)
};

exports.isPhone=function (number) {
    number=stringFormat(number)
    if (!validator.isMobilePhone(number))
    {
        console.log("isPhone")
        return false;
    }
    return number
};

exports.isLatitude=function (lat) {
    if (!validator.isLatLong(stringFormat(lat)+","+"32.690705"))
    {
        console.log("isLatitude")
        return false;
    }
    return lat
};

exports.isLongitude=function (lon) {
    if (!validator.isLatLong("39.900472"+","+stringFormat(lon)))
    {
        console.log("isLongitude")
        return false;
    }
    return lon
};
exports.isHour=function (hour) {

    if(hour.includes(":"))
    {
        let hora=hour.split(":")

        if(hora.length==2)
        {
            hora[0]=parseInt(hora[0])
            hora[1]=parseInt(hora[1])
            if(hora[0]>=0 && hora[0]<=23 && hora[1]>=0 && hora[1]<=59)
                return  true
            else
                return false
        }
        else
            return false
    }
    else
        return false
}




let isValid = function (obj, format) {
    if (!format.hasOwnProperty("fields"))
        return false;

    let i;
    let item;
    for(i=0;i<format.fields.length;i++)
    {
        item=format.fields[i]
        if (obj.hasOwnProperty(item.name))                                   //ESTA
        {
            let res = item.verification(obj[item.name]);                     //RESPUESTA DE VALIDACION
            console.log(res);
            if (res === false)                                               //FALLO LA VALIDACION
                return false;
            else                                                             //PASO LA VALIDACION
            {
                obj[item.name] = res;                                        //FORMATO PARA EL OBJETO

                if (!this.isValid(obj[item.name], {fields: item.children}))  //MANDAR HIJOS
                    return false

            }

        }
        else                                                               //NO ESTA
        {
            if (item.require)
                return false

        }


    }
    return true;


};

function stringFormat(number)
{
    return ""+number
}


exports.isValid = isValid;

