const EXCHANGE_RATE_HKD_TO_CNY = 0.92;

function generateRandomNumbers() {
    const rand7 = Math.floor(1000000 + Math.random() * 9000000);
    const rand6 = Math.floor(100000 + Math.random() * 900000);

    const chargeNo = `3-21-1-0${rand7.toString().padStart(6, '0')}-8`;
    const shroffNo = `32110${rand7.toString().padStart(6, '0')}8`;
    const instrumentRef = `3-21-${rand6}-0-0-0`;
    const barcodeVal = `83050206000000001000015${shroffNo}30`;

    document.getElementById('display-charge-no').innerText = chargeNo;
    document.getElementById('display-shroff-no').innerText = shroffNo;
    document.getElementById('display-bottom-chargeno').innerText = chargeNo;
    document.getElementById('display-instrument-ref').innerText = instrumentRef;
    document.getElementById('display-barcode-text').innerText = barcodeVal;

    try {
        JsBarcode("#barcode-element", barcodeVal, {
            format: "CODE128",
            width: 1.1,
            height: 35,
            displayValue: false,
            margin: 0
        });
    } catch(e) { console.log(e); }
}

function calculateAndSync() {
    const rawZhName = document.getElementById('input-name-zh').value.trim();
    const rawEnName = document.getElementById('input-name-en').value.trim();
    const cnyInputVal = document.getElementById('input-amount-cny').value.trim();

    if (rawZhName || rawEnName) {
        const zhNameDisplay = rawZhName ? ` (${rawZhName})` : "";
        const enNameDisplay = rawEnName ? rawEnName.toUpperCase() : "";
        document.getElementById('display-taxpayer-name').innerText = `${enNameDisplay}${zhNameDisplay}`;
    } else {
        document.getElementById('display-taxpayer-name').innerText = "";
    }

    if (cnyInputVal !== "") {
        const cnyAmount = parseFloat(cnyInputVal) || 0;
        const hkdAmount = cnyAmount / EXCHANGE_RATE_HKD_TO_CNY;

        const hkdFormatted = hkdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const cnyFormatted = cnyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const dualCurrencyText = `$ ${hkdFormatted} (折合RMB${cnyFormatted})`;
        
        document.getElementById('display-amount-stamp-original').innerText = dualCurrencyText;
        document.getElementById('display-total-amount').innerText = `${hkdFormatted}(折合RMB${cnyFormatted})`;
        document.getElementById('display-bottom-amount').innerText = `$${hkdFormatted}`;
    } else {
        document.getElementById('display-amount-stamp-original').innerText = "$0.00";
        document.getElementById('display-total-amount').innerText = "0.00";
        document.getElementById('display-bottom-amount').innerText = "$0.00";
    }
}

function validateInputs() {
    const zhName = document.getElementById('input-name-zh').value.trim();
    const enName = document.getElementById('input-name-en').value.trim();
    const amountCny = document.getElementById('input-amount-cny').value.trim();

    if (!zhName || !enName || !amountCny) {
        const panel = document.getElementById('action-control-panel');
        panel.classList.remove('shake');
        void panel.offsetWidth; 
        panel.classList.add('shake');
        showToast("请完整填写中文名、英文名与人民币金额！", 'error');
        return false;
    }
    return true;
}

async function copyReceiptAsImage() {
    if (!validateInputs()) return;

    const targetElement = document.getElementById('receipt-capture-area');
    const copyBtn = document.getElementById('btn-copy');

    copyBtn.innerText = "处理中...";
    copyBtn.disabled = true;

    try {
        const canvas = await html2canvas(targetElement, {
            scale: 3, 
            dpi: 300,
            allowTaint: false,
            useCORS: true,
            backgroundColor: "#ffffff"
        });

        canvas.toBlob(async (blob) => {
            if (!blob) throw new Error("图片生成失败");

            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    const item = new ClipboardItem({ [blob.type]: blob });
                    await navigator.clipboard.write([item]);
                    
                    copyBtn.classList.add('copied');
                    copyBtn.innerText = "已复制成功！";
                    showToast("已成功复制图片到剪贴板！", "success");

                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerText = "生成并复制图片";
                        copyBtn.disabled = false;
                    }, 3000);
                } catch (err) {
                    console.error(err);
                    showToast("复制失败，请确认页面已通过 HTTP/HTTPS 环境打开且已授予剪贴板权限", "error");
                    copyBtn.innerText = "生成并复制图片";
                    copyBtn.disabled = false;
                }
            } else {
                showToast("当前浏览器环境不支持图片写入剪贴板", "error");
                copyBtn.innerText = "生成并复制图片";
                copyBtn.disabled = false;
            }
        }, "image/png");

    } catch (err) {
        console.error(err);
        showToast("渲染失败，请检查资源路径或 CORS 跨域设置", "error");
        copyBtn.innerText = "生成并复制图片";
        copyBtn.disabled = false;
    }
}

function showToast(msg, type = 'error') {
    const toast = document.getElementById('customToast');
    toast.innerText = msg;
    toast.className = 'custom-toast';
    toast.classList.add(type);
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

function initDates() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    const issueDateStr = `${d}/${m}/${y}`;
    
    const dueDateObj = new Date(today);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueY = dueDateObj.getFullYear();
    const dueM = String(dueDateObj.getMonth() + 1).padStart(2, '0');
    const dueD = String(dueDateObj.getDate()).padStart(2, '0');
    const dueDateStr = `${dueD}/${dueM}/${dueY}`;

    document.getElementById('display-date-issue').innerText = issueDateStr;
    document.getElementById('display-date-request').innerText = issueDateStr;
    document.getElementById('display-date-due').innerText = dueDateStr;
    document.getElementById('display-bottom-duedate').innerText = dueDateStr;
}

document.querySelectorAll('.control-panel input').forEach(element => {
    element.addEventListener('input', calculateAndSync);
});

window.onload = function() {
    initDates();
    generateRandomNumbers();
    calculateAndSync();
};
