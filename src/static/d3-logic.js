window.actionQueue = [];       
window.currentStepIdx = -1;    
window.isPlaying = false;      
window.autoPlayTimer = null;   
window.animationSpeed = 1000; 

window.onload = async () => {
    updateSpeed();
    await loadInitialArray();
};

async function handleSetSeed() {
    const seedVal = document.getElementById("seed-input").value;

    const res = await callTreapApi('set_seed', { seed: parseInt(seedVal) });
    if (res && res.success) {
        console.log("Seed set successfully");
        await loadInitialArray(); 
    }
}

async function loadInitialArray() {
    const statusEl = document.getElementById("status-display");
    statusEl.innerText = "Building...";

    const initNodes = [ { val: 4 }, { val: 8 }, { val: 7 } ];
    const res = await callTreapApi('treap_build', { nodes: initNodes });
    

    if (res && res.success && Array.isArray(res.data)) {
        window.actionQueue = res.data;
        window.currentStepIdx = window.actionQueue.length - 1; 
        updateFrame();
        statusEl.innerText = "Completed";
    } else {
        statusEl.innerText = "API 資料格式錯誤";
    }
}

async function callTreapApi(endpoint, payload = {}) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("無法連線至後端 API:", error);
        document.getElementById("status-display").innerText = "連線失敗";
        return null;
    }
}

function updateFrame() {
    if (window.currentStepIdx >= 0 && window.currentStepIdx < window.actionQueue.length) {
        const frame = window.actionQueue[window.currentStepIdx];
        document.getElementById("status-display").innerText = frame.name || "運算中";
        if (typeof window.updateTreap === "function") {
            window.updateTreap(frame);
        }
    }
}


function togglePlay() {
    window.isPlaying = !window.isPlaying;
    const btn = document.getElementById("play-pause-btn");
    btn.innerText = window.isPlaying ? "Pause" : "Play";
    if (window.isPlaying) startAutoPlay();
    else clearTimeout(window.autoPlayTimer);
}

function startAutoPlay() {
    if (!window.isPlaying) return;
    if (window.currentStepIdx < window.actionQueue.length - 1) {
        window.autoPlayTimer = setTimeout(() => {
            stepNext();
            startAutoPlay();
        }, window.animationSpeed);
    } else {
        window.isPlaying = false;
        document.getElementById("play-pause-btn").innerText = "Play";
    }
}

function stepNext() {
    if (window.currentStepIdx < window.actionQueue.length - 1) {
        window.currentStepIdx++;
        updateFrame();
    }
}

function stepBack() {
    if (window.currentStepIdx > 0) {
        window.currentStepIdx--;
        updateFrame();
    }
}

function updateSpeed() {
    window.animationSpeed = 2200 - parseInt(document.getElementById("speed-slider").value);
}

async function handleAction(type) {
    const val = parseInt(document.getElementById("input-val").value);
    const pos = parseInt(document.getElementById("input-pos").value) || 0;
    
    const res = await callTreapApi(`treap_${type}`, type === 'insert' ? { pos, val } : { pos });
    if (res && res.success && Array.isArray(res.data)) {
        window.actionQueue = res.data;
        window.currentStepIdx = 0; 
        updateFrame();
    }
}

// 在 d3-logic.js 中修改
async function handleClear() {
    // 1. 呼叫後端清空資料的 API
    const res = await callTreapApi('treap_clear'); 
    
    if (res && res.success) {
        // 2. 清空前端的動畫佇列
        window.actionQueue = [];
        window.currentStepIdx = -1;
        
        // 3. 讓 SVG 畫面變空白
        svg.selectAll("*").remove(); 
        
        // 4. 更新狀態顯示
        document.getElementById("status-display").innerText = "已清空";
        console.log("Treap 已成功清空");
    } else {
        location.reload(); 
    }
}
