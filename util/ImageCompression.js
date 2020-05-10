
var compress_images = require('compress-images');
const log = require('log-to-file');

exports.images_compress=function(input_path,output_path){

    try{

    const INPUT_path_to_your_images = input_path;
    const OUTPUT_path = output_path;


    compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true, pathLog: './log/lib/compress-images'}, false,
        {jpg: {engine: 'jpegtran', command: false}},
        {png: {engine: 'pngquant', command: ['--quality=20-50']}},
        {svg: {engine: false, command: false}},
        {gif: {engine: false, command: false}}, function(err, completed){
            if(err !== null){
                //---------------------------------------
                //if you get an ERROR from 'jpegtran' ---> We can use alternate config of compression
                //---------------------------------------
                compress_images(err.input, err.output, {compress_force: false, statistic: true, autoupdate: true}, false,
                    {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
                    {png: {engine: optipng, command: false}},
                    {svg: {engine: false, command: false}},
                    {gif: {engine: false, command: false}}, function(err){
                        if(err !== null){
                            //Alternative config of compression
                        }
                    });
                //---------------------------------------
            }
        });

        log("image compres");

    return  true
    }catch(error){
        log("Error compress image",'error.log');
        return false
    }



};
