document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#0071e3';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#86868b';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#86868b';
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            handleImageUpload(file);
        }
    });

    // 文件选择处理
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 质量滑块变化事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        originalFile = file;
        originalSize.textContent = formatFileSize(file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            compressImage(file, qualitySlider.value / 100);
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // 计算新的尺寸
                let newWidth = img.width;
                let newHeight = img.height;
                
                // 如果是PNG，根据质量参数调整尺寸
                if (file.type === 'image/png') {
                    const scale = 0.5 + (quality * 0.5); // 质量0-1映射到0.5-1的缩放比例
                    newWidth = Math.floor(img.width * scale);
                    newHeight = Math.floor(img.height * scale);
                }
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                const ctx = canvas.getContext('2d');
                
                // 使用双线性插值算法
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // 清空画布
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // 根据图片类型选择压缩策略
                if (file.type === 'image/png') {
                    canvas.toBlob((blob) => {
                        handleCompressedBlob(blob, file.name);
                    }, 'image/png');
                } else {
                    canvas.toBlob((blob) => {
                        handleCompressedBlob(blob, file.name);
                    }, 'image/jpeg', quality);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 处理压缩后的blob
    function handleCompressedBlob(blob, fileName) {
        // 如果压缩后的大小大于原始大小，使用原始文件
        if (blob.size >= originalFile.size) {
            compressedSize.textContent = formatFileSize(originalFile.size) + ' (建议使用原图)';
            compressedImage.src = URL.createObjectURL(originalFile);
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(originalFile);
                link.download = fileName;
                link.click();
            };
        } else {
            compressedSize.textContent = formatFileSize(blob.size);
            compressedImage.src = URL.createObjectURL(blob);
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `compressed_${fileName}`;
                link.click();
            };
        }
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 