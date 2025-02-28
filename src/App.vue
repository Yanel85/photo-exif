<template>
    <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
            {{ isEnglish ? "Photo EXIF Information Viewer" : "图片 EXIF 信息查询" }}
        </h1>
        <p class="text-center">
            {{ isEnglish ? "Quickly read Camera, Phones, lens model, exposure parameters, shutter count, and GPS  location information." : "快速读取相机、手机品牌、镜头型号、曝光参数、快门次数和GPS定位等信息。" }}
            <br>
            {{ isEnglish ? "This tool reads photo information through the browser, and the photo files are not uploaded  to the server, please feel free to use it." : "此工具通过浏览器读取照片信息，照片文件不会上传到服务器，请放心使用。" }}
            <br>
            {{ isEnglish ? "Please upload the original photo." : "请上传原图, 通过微信或QQ转发的照片EXIF信息可能会变化或丢失。" }}
            <br>
        </p>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2710408585614522" crossorigin="anonymous"></script>
        <ImageLoader @imageLoaded="handleImageLoaded" @error="handleError" />
        <ExifDisplay :exifData="exifData" />
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import ExifDisplay from './components/ExifDisplay.vue';
    import ImageLoader from './components/ImageLoader.vue'

    const exifData = ref(null);
    const isEnglish = ref(getLanguagePreference());
    function getLanguagePreference() {
        const lang = navigator.language || navigator.userLanguage; // 获取浏览器语言
        return !lang.startsWith('zh'); // 如果不是中文，则返回 true
    }

    const handleImageLoaded = (tags) => {
        const groupedData = {
            "BasicInfo": {},
            "CameraSettings": {},
            "ExposureInfo": {},
            "GpsInfo": {},
            "OtherInfo": {}
        };

        for (const tag in tags) {
            const value = tags[tag].value;
            if (
                [
                    'ImageDescription',
                    'Copyright',
                    'Artist',
                    'CreateDate',
                    'ModifyDate',
                    'Image Width',
                    'Image Height',
                    'ThumbnailOffset',
                    'ThumbnailLength',
                    'ThumbnailJPEGInterchangeFormat',
                    'ThumbnailJPEGInterchangeFormatLength',
                    'format',
                    'RawFileName'
                ].includes(tag)
            ) {
                groupedData["BasicInfo"][tag] = value;
            } else if (
                [
                    'Make',
                    'Model',
                    'LensMake',
                    'LensModel',
                    'Software',
                    'Orientation',
                    'BodySerialNumber',
                    'FocalLengthIn35mmFilm',
                    'LensInfo'
                ].includes(tag)
            ) {
                groupedData["CameraSettings"][tag] = value;
            } else if (
                [
                    'ExposureTime',
                    'ISOSpeedRatings',
                    'ExposureBiasValue',
                    'MeteringMode',
                    'Flash',
                    'FNumber',
                    'WhiteBalance',
                    'Saturation',
                    'Sharpness',
                    'Contrast',
                    'SceneCaptureType',
                    'Color Space'
                ].includes(tag)
            ) {
                groupedData["ExposureInfo"][tag] = value;
            } else if (
                ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSTimeStamp', 'GPSDateStamp', 'GPSAltitudeRef'].includes(tag)
            ) {
                groupedData["GpsInfo"][tag] = value;
            } else {
                groupedData["OtherInfo"][tag] = value;
            }

        }
        exifData.value = groupedData
    }
    const handleError = (err) => {
        exifData.value = null
    }
</script>