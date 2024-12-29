<template>
    <div class="m-4 flex flex-col md:flex-row gap-6">
        <div class="flex-1">
            <div class="relative m-1">
                <label class="flex flex-col items-center px-4 py-4 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition duration-300">
                    <svg class="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                    </svg>
                    <span class="mt-2 text-base leading-normal"> {{ isEnglish ? "Upload the original photo" : "上传图片" }}</span>
                    <input type="file" id="imageUpload" @change="handleFileUpload" class="hidden" accept="image/*,.dng,.cr2,.nef,.arw" />
                    <span class="text-gray-500 text-xs mt-1">Supports: JPEG, PNG, TIFF, DNG, CR2, NEF, ARW</span>
                </label>
            </div>
            <!--div class="flex">
                <input type="text" id="imageUrl" v-model="imageUrl" placeholder="请输入图片 URL"
                    class="shadow appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hover:border-blue-500" />
                <button @click="handleUrlLoad"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-8 rounded ml-2 shadow-md">加载
                </button>
            </div-->
        </div>
    </div>
    <div class="flex justify-center">
        <div v-if="previewUrl" class="mb-4  flex  items-start flex-col md:flex-row ">
            <img :src="previewUrl" alt="Image Preview" class="max-w-xs aspect-[4/3] rounded shadow-md mb-4">
            <div v-if="formattedGps" class="flex flex-col">
                <!--span>{{ formattedGps }}</span-->
                <div ref="mapContainer" id="container" class="w-[320px] h-[240px]  rounded-md  shadow-md"></div>
            </div>
        </div>
    </div>
    <div v-if="loading" class="text-center text-gray-600">loading...</div>
    <div v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
    import * as exifreader from 'exifreader';

    const imageUrl = ref('');
    const loading = ref(false);
    const error = ref(null);
    const previewUrl = ref(null);
    const formattedGps = ref(null)
    let map = null;
    const mapContainer = ref(null);
    const emit = defineEmits(['imageLoaded', 'error'])

    const placeholderSVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTU2LjY2NjcgMjQuNjY2N1Y1Ni42NjY3SDcuMzMzMzZWMjQuNjY2N0g1Ni42NjY3WiIgZmlsbD0iI0U0RTlFRiIvPgo8cGF0aCBkPSJNNi42NjY2NyA2LjY2NjY3SDU3LjMzMzNDNjAuMDA0MSA2LjY2NjY3IDYyLjY2NjcgOS4zMjkzNiA2Mi42NjY3IDEyLjY2NjZWMzcuMzMzM0g1Ny4zMzMzVjEyLjY2NjZINi42NjY2N1Y2LjY2NjY3WiIgZmlsbD0iI0U0RTlFRiIvPgo8cGF0aCBkPSJNMzIgNDIuNjY2NjdDNDEuMDQ1OSA0Mi42NjY3IDQ4IDM1LjcwMjYgNDggMjYuNjY2NjdDMjggMjYuNjY2NyAxMiAyOC42NjY3IDMyIDQyLjY2NjY3WiIgZmlsbD0iI0U0RTlFRiIvPgo8cGF0aCBkPSJNNi42NjY2NyA1MS4zMzMzVjU3LjMzMzNINjIuNjY2N1Y1MS4zMzMzSDYuNjY2NjdaIiBmaWxsPSIjRTBFNUY0Ii8+CjxwYXRoIGQ9Ik01NC42NjY3IDU1LjMzMzNIMTQuMDAwM0MxMi4yODQ3IDU1LjMzMzMgMTAuNjY2NyA1My43MTUzIDEwLjY2NjcgNTEuOTk5O1Y0NS4zMzMzSDU4LTY0LjY2NjZWMjAuNjY2N0g1NC42NjY3VjU1LjMzMzNaIiBmaWxsPSIjRTBFNUY0Ii8+CjxwYXRoIGQ9Ik01My4zMzMzIDMzLjMzMzNDNTIuNTM3NCAzMS43Nzk5IDUxLjQ1NjkgMzIuNjA2MSA1MC41NjI2IDMzLjMzMzNDNDYuMzU1IDM3LjUyMDggMzkuMzMzMyAzMi4zOTY5IDM0LjY0MDcgMjYuNjY2N0M0Mi4zNjE1IDI4LjI3MDggNDcuNjY2NyAzMi4zMDYzIDUzLjMzMzMgMzMuMzMzM1oiIGZpbGw9IiNCMkM4Q0EiLz4KPHBhdGggZD0iTTU2IDMzLjMzMzNDNTUuMDQ3IDMxLjgwNjQgNTQuMzM0NyAzMi40MjE4IDUzLjUzODcgMzMuMzMzM0M0OS4yMjk1IDM3LjU4MjUgNDQuMDM0NCAzMi40MDc1IDM5LjU0MzIgMjYuNjY2N0M0Ni41OTgzIDI4LjI2MDQgNTIuMjY0OSAzMi4yNzA2IDU2IDMzLjMzMzNaIiBmaWxsPSIjQjJDOENBIi8+CjxwYXRoIGQ9Ik0yNi42NjY3IDguMDAwMDVDMjIuMzc0NiA4LjAwMDA1IDE5LjMzMzQgMTEuMjc0NCAxOS4zMzM0IDE1LjY2NjZDMjIuMDkwNCAxNS42NjY2IDIzLjQ3NTEgMTYuNDI2NyAyMy42NjY3IDE3LjMzMzNIMzcuMzMzM1Y4LjAwMDA1SDI2LjY2NjdaIiBmaWxsPSIjRjBGMDY4Ii8+Cjwvc3ZnPg=='

    const isEnglish = ref(getLanguagePreference());
    function getLanguagePreference() {
        const lang = navigator.language || navigator.userLanguage; // 获取浏览器语言
        return !lang.startsWith('zh'); // 如果不是中文，则返回 true
    }

    const parseDMS = (dmsString) => {
        if (!dmsString) return null;

        const parts = String(dmsString).split(',').map(Number);
        if (parts.length !== 6) return null;

        const [degrees, flag1, value, flag2, divisor, flag3] = parts;

        let minutes = 0;
        let seconds = 0;

        // 处理 value，根据其值判断是分钟还是秒
        if (value < 60) {
            minutes = value; // 认为是分钟
            seconds = divisor / flag3;
        } else {
            seconds = value / flag2; // 认为是秒数
        }

        // 根据输入格式生成结果对象
        return {
            degrees,
            minutes,
            seconds: seconds.toFixed(8), // 转换为小数，保留8位
        };
    };

    const formatDMS = (dms) => {
        if (!dms) return null
        const { degrees, minutes, seconds, direction } = dms;
        //return `${degrees}°${minutes}'${seconds}"${direction || ''}`
        const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
        return decimalDegrees;

    };


    // WGS-84 to GCJ-02
    const transformLat = (lng, lat) => {
        let lat0 = +lat;
        let lng0 = +lng;
        let ret =
            -100.0 +
            2.0 * lng0 +
            3.0 * lat0 +
            0.2 * lat0 * lat0 +
            0.1 * lng0 * lat0 +
            0.2 * Math.sqrt(Math.abs(lng0));
        ret +=
            ((20.0 * Math.sin(6.0 * lng0 * Math.PI)) + (20.0 * Math.sin(2.0 * lng0 * Math.PI))) * 2.0 / 3.0;
        ret +=
            ((20.0 * Math.sin(8.0 * lat0 * Math.PI)) + (20.0 * Math.sin(2.0 * lat0 * Math.PI))) * 2.0 / 3.0;
        ret +=
            ((16.0 * Math.sin(2.0 * lat0 * Math.PI)) + (16.0 * Math.sin(2.0 * lng0 * Math.PI))) * 2.0 / 3.0;
        return ret;
    }

    const transformLng = (lng, lat) => {
        let lat0 = +lat;
        let lng0 = +lng;
        let ret =
            300.0 +
            lng0 +
            2.0 * lat0 +
            0.1 * lng0 * lng0 +
            0.1 * lng0 * lat0 +
            0.1 * Math.sqrt(Math.abs(lng0));
        ret +=
            ((20.0 * Math.sin(6.0 * lng0 * Math.PI)) + (20.0 * Math.sin(2.0 * lng0 * Math.PI))) * 2.0 / 3.0;
        ret +=
            ((20.0 * Math.sin(8.0 * lng0 * Math.PI)) + (20.0 * Math.sin(2.0 * lat0 * Math.PI))) * 2.0 / 3.0;
        ret +=
            ((15.0 * Math.sin(2.0 * lat0 * Math.PI)) + (15.0 * Math.sin(2.0 * lng0 * Math.PI))) * 2.0 / 3.0;
        return ret;
    }

    const wgsToGcj = (lng, lat) => {
        let dlat = transformLat(lng - 105.0, lat - 35.0);
        let dlng = transformLng(lng - 105.0, lat - 35.0);
        const radLat = (lat / 180.0) * Math.PI;
        let magic = Math.sin(radLat);
        magic = 1 - 0.00669342162296594323 * magic * magic;
        const sqrtMagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / (((6378245.0 * (1 - 0.00669342162296594323)) / (magic * sqrtMagic) * Math.PI));
        dlng = (dlng * 180.0) / ((6378245.0 / sqrtMagic) * Math.cos(radLat) * Math.PI);
        return {
            lng: +lng + dlng,
            lat: +lat + dlat,
        };
    }

    const initMap = (latitude, longitude) => {
        if (latitude && longitude) {
            const gcj = wgsToGcj(longitude, latitude);
            const position = new AMap.LngLat(gcj.lng, gcj.lat);
            // 创建地图实例
            if (mapContainer.value) {
                map = new AMap.Map(mapContainer.value, {
                    zoom: 9,
                    center: position,
                    resizeEnable: true
                });
                const markerContent = '' +
                    '<div class="custom-content-marker">' +
                    '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png" style=" width: 20px;">' +
                    '</div>';

                const marker = new AMap.Marker({
                    position: position,
                    content: markerContent,
                    offset: new AMap.Pixel(-13, -30)
                });

                map.add(marker);
            }
        }
        else {
            if (map) {
                map = null
            }
        }

    };



    const processImage = async (file) => {
        loading.value = true;
        error.value = null;
        previewUrl.value = null;
        formattedGps.value = null
        try {
            if (file instanceof Blob) {
                const fileType = file.type || '';
                const isRaw = /\.(cr2|nef|arw|dng)$/i.test(file.name) || /(image\/(x-canon-cr2|x-nikon-nef|x-sony-arw|x-adobe-dng))/.test(fileType)
                if (isRaw) {
                    previewUrl.value = placeholderSVG;
                } else {
                    previewUrl.value = URL.createObjectURL(file);
                }

            }
            const tags = await exifreader.load(file);
            let latitude = null;
            let longitude = null;

            for (const tag in tags) {
                const value = tags[tag].value;
                if (tag === 'GPSLatitude') {
                    latitude = parseDMS(value);
                } else if (tag === 'GPSLongitude') {
                    longitude = parseDMS(value)
                }
            }

            if (latitude && longitude) {
                const formattedLat = formatDMS(latitude);
                const formattedLong = formatDMS(longitude);
                formattedGps.value = `${formattedLat}, ${formattedLong}`;
                await nextTick()
                initMap(formattedLat, formattedLong);
            } else {
                initMap(null, null)
            }
            emit('imageLoaded', tags);
        } catch (err) {
            //console.error("解析 EXIF 信息失败:", err);
            error.value = `解析 EXIF 信息失败：${err.message || '请检查图片格式或URL'}`;
            emit('error', error.value);
        } finally {
            loading.value = false;
        }
    };


    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            processImage(file);
        }
    };

    const handleUrlLoad = async () => {
        if (imageUrl.value) {
            loading.value = true;
            error.value = null;
            previewUrl.value = null;
            formattedGps.value = null
            try {
                const response = await fetch(imageUrl.value);
                if (!response.ok) {
                    const message = `HTTP error! status: ${response.status} ${response.statusText}`
                    throw new Error(message)
                }
                const blob = await response.blob();
                processImage(blob);
            } catch (err) {
                //console.error("加载 URL 失败:", err);
                error.value = `加载 URL 失败: ${err.message || '请检查URL是否正确'}`;
                emit('error', error.value);
            } finally {
                loading.value = false;
            }
        }
    };


    onMounted(() => {
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=24cb4cde49e64ef387234391a59cb375`;
        script.async = true;
        script.defer = true
        document.head.appendChild(script);
    });
    onUnmounted(() => {
        if (map) {
            map = null
        }
    })


    watch(formattedGps, async (newVal) => {
        if (newVal) {
            const [lat, lng] = newVal.split(',').map(str => {
                const match = str.match(/([\d.]+)([NS|EW])/);
                if (match) {
                    const value = parseFloat(match[1])
                    return match[2] === 'S' || match[2] === 'W' ? -value : value
                }
                return null
            })
            if (lat && lng && mapContainer.value) {
                await nextTick()
                initMap(lat, lng)
            }
        }
    })

</script>
