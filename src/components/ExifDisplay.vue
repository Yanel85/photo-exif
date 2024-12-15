<template>
    <div v-if="exifData" class="mt-4">
        <div v-for="(group, groupName) in exifData" :key="groupName" class="mb-4 border rounded shadow-md bg-white">
            <button @click="toggleGroup(groupName)"
                class="w-full text-left py-2 px-4 font-semibold hover:bg-gray-50 flex justify-between items-center">
                <span class="text-gray-800">{{ groupName }}</span>
                <span :class="{ 'rotate-180': expandedGroups[groupName] }"
                    class="transition-transform duration-200 transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </button>
            <div v-show="expandedGroups[groupName]" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-if="Object.keys(group).length === 0">
                            <td colspan="2" class="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                                无信息
                            </td>
                        </tr>
                        <tr v-for="(value, key) in group" :key="key" :class="{ 'bg-gray-50': $index % 2 === 1 }">
                            <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right w-32">
                                {{ translatedKeys[key] || key }}:
                            </td>
                            <td class="px-6 py-3  text-sm text-gray-700" style="overflow-x:auto; max-width: 400px;">
                                {{ formatValue(value) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    exifData: {
        type: Object,
        required: true
    },
});

const expandedGroups = ref({});

const toggleGroup = (groupName) => {
    expandedGroups.value[groupName] = !expandedGroups.value[groupName];
};
watch(() => props.exifData, () => {
    if (props.exifData) {
        for (const groupName in props.exifData) {
            expandedGroups.value[groupName] = groupName === '基本信息' || groupName === '相机设置'
        }
    }
}, { deep: true, immediate: true })

const formatValue = (value) => {
    const stringValue = String(value)
    if (typeof stringValue === 'string') {
        // 移除字符串首尾的 [ 和 ]
        let formattedValue = stringValue.replace(/^\[|\]$/g, '');
        // 移除字符串首尾的 "
        formattedValue = formattedValue.replace(/^"|"$/g, '');
        return formattedValue;
    }
    if (Array.isArray(value)) {
        return value.map(item => formatValue(item))
    }
    return value;
};
const translatedKeys = {
    'FileType': '图片格式',
    'ImageDescription': '图像描述',
    'Copyright': '版权信息',
    'Artist': '作者',
    'DateTime': '修改时间',
    'DateTimeOriginal': '原始时间',
    'Make': '相机制造商',
    'Model': '相机型号',
    'LensMake': '镜头制造商',
    'LensModel': '镜头型号',
    'Software': '使用软件',
    'Orientation': '图像方向',
    'BodySerialNumber': '机身序列号',
    'ExposureTime': '曝光时间',
    'FNumber': '光圈值',
    'ISO': 'ISO 感光度',
    'ExposureBiasValue': '曝光补偿',
    'MeteringMode': '测光模式',
    'Flash': '闪光灯',
    'ShutterSpeedValue': '快门速度',
    'ApertureValue': '光圈值',
    'FocalLength': '焦距',
    'FocalLengthIn35mmFormat': '35mm 等效焦距',
    'LensSpecification': '镜头规格',
    'ColorSpace': '色彩空间',
    'WhiteBalance': '白平衡',
    'Saturation': '饱和度',
    'Sharpness': '锐度',
    'Contrast': '对比度',
    'SceneCaptureType': '场景拍摄类型',
    'Image Width': '图像宽度',
    'Image Height': '图像高度',
    'ResolutionUnit': '分辨率单位',
    'XResolution': '水平分辨率',
    'YResolution': '垂直分辨率',
    'GPSLatitude': '纬度',
    'GPSLongitude': '经度',
    'GPSAltitude': '海拔',
    'GPSTimeStamp': '时间',
    'GPSDateStamp': '日期',
    'GPSAltitudeRef': '海拔参考',
    'ThumbnailOffset': '缩略图偏移',
    'ThumbnailLength': '缩略图长度',
    'ThumbnailJPEGInterchangeFormat': '缩略图 JPEG 格式',
    'ThumbnailJPEGInterchangeFormatLength': '缩略图 JPEG 长度'
};
</script>