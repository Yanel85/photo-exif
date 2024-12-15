<template>
    <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">图片 EXIF 信息查询</h1>
        <p class="text-center">
            快速读取相机、手机品牌、镜头型号、曝光参数、快门次数和GPS定位等信息<br>
            此工具通过浏览器读取照片信息，照片文件不会上传到服务器，请放心使用<br>
            请上传原图,通过微信或QQ转发的照片EXIF信息可能会变化或丢失<br>
        </p>
        <ImageLoader @imageLoaded="handleImageLoaded" @error="handleError" />
        <ExifDisplay :exifData="exifData" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ExifDisplay from './components/ExifDisplay.vue';
import ImageLoader from './components/ImageLoader.vue'

const exifData = ref(null);

const handleImageLoaded = (tags) => {
    const groupedData = {
        "基本信息": {},
        "相机设置": {},
        "曝光信息": {},
        "GPS 信息": {},
        "其他信息": {}
    };

    for (const tag in tags) {
        const value = tags[tag].value;
        if (
            [
                'ImageDescription',
                'Copyright',
                'Artist',
                'DateTime',
                'DateTimeOriginal',
                'Image Width',
                'Image Height',
                'ResolutionUnit',
                'XResolution',
                'YResolution',
                'ThumbnailOffset',
                'ThumbnailLength',
                'ThumbnailJPEGInterchangeFormat',
                'ThumbnailJPEGInterchangeFormatLength',
                'FileType'
            ].includes(tag)
        ) {
            groupedData["基本信息"][tag] = value;
        } else if (
            [
                'Make',
                'Model',
                'LensMake',
                'LensModel',
                'Software',
                'Orientation',
                'BodySerialNumber',
                'FocalLength',
                'FocalLengthIn35mmFormat',
                'LensSpecification'
            ].includes(tag)
        ) {
            groupedData["相机设置"][tag] = value;
        } else if (
            [
                'ExposureTime',
                'FNumber',
                'ISO',
                'ExposureBiasValue',
                'MeteringMode',
                'Flash',
                'ShutterSpeedValue',
                'ApertureValue',
                'ColorSpace',
                'WhiteBalance',
                'Saturation',
                'Sharpness',
                'Contrast',
                'SceneCaptureType'
            ].includes(tag)
        ) {
            groupedData["曝光信息"][tag] = value;
        } else if (
            ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSTimeStamp', 'GPSDateStamp', 'GPSAltitudeRef'].includes(tag)
        ) {
            groupedData["GPS 信息"][tag] = value;
        } else {
            groupedData["其他信息"][tag] = value;
        }

    }
    exifData.value = groupedData
}
const handleError = (err) => {
    exifData.value = null
}
</script>