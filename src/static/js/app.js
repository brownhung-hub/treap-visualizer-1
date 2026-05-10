
window.actionQueue = [];
window.currentStepIdx = -1;  
window.animationSpeed = 500; 

async function callTreapApi(endpoint, method = 'POST', data = {}) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (method === 'POST') options.body = JSON.stringify(data);

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/${endpoint}`, options);
        const res = await response.json();
        
        if (!response.ok || !res.success) {
            document.getElementById("status-display").innerText = "Error: " + (res.data || "Unknown Error");
            return null;
        }
        return res;
    } catch (err) {
        document.getElementById("status-display").innerText = "伺服器連線中斷";
        return null;
    }
}


async function handleInsert() {
    const val = parseInt(document.getElementById("insert-val").value);
    const pos = parseInt(document.getElementById("insert-pos").value);
    if (isNaN(val) || isNaN(pos)) return;


    const res = await callTreapApi('treap_insert', 'POST', { 
        pos: pos,
        val: val 
    });

    if (res && res.success) {
        window.actionQueue = res.data; 
        window.currentStepIdx = 0;
        updateFrame();
        // document.getElementById("status-display").innerText = `Ready (Inserted ${val})`;
    }
}

async function handleRemove() {
    const pos = parseInt(document.getElementById("remove-pos").value);
    if (isNaN(pos)) return;


    const res = await callTreapApi('treap_remove', 'POST', { pos: pos });

    if (res && res.success) {
        window.actionQueue = res.data;
        window.currentStepIdx = 0;
        updateFrame();
        // document.getElementById("status-display").innerText = `Ready (Removed pos ${pos})`;
    }
}

async function handleQuery() {
    const l = parseInt(document.getElementById("query-l").value);
    const r = parseInt(document.getElementById("query-r").value);
    if (isNaN(l) || isNaN(r)) return;

    const res = await callTreapApi('treap_query', 'POST', { l: l, r: r });

    if (res && res.success) {
        window.actionQueue = res.data;
        window.currentStepIdx = 0;
        updateFrame();
    }
}

async function handleClear() {
    const res = await callTreapApi('treap_clear', 'GET');
    if (res && res.success) {
        window.actionQueue = [];
        window.currentStepIdx = -1;
        
        if (typeof clearCanvas === "function") clearCanvas();
        
        document.getElementById("status-display").innerText = "Ready (Cleared & Initialized)";
        
        console.log("Treap has been cleared safely.");
    }
}



function updateFrame() {
    const currentStep = window.actionQueue[window.currentStepIdx];
    if (currentStep) {
        renderTreap(currentStep); 
        
        let statusText = `Step ${window.currentStepIdx + 1}/${window.actionQueue.length}: ${currentStep.name}`;
        
        if (currentStep.query_result !== undefined) {
            statusText += ` -> Result (Max): ${currentStep.query_result}`;
        }
        
        document.getElementById("status-display").innerText = statusText;
    }
}

function handleNext() {
    if (window.currentStepIdx < window.actionQueue.length - 1) {
        window.currentStepIdx++;
        updateFrame();
    }
}

function handlePrev() {
    if (window.currentStepIdx > 0) {
        window.currentStepIdx--;
        updateFrame();
    }
}

let playTimer = null;
function handlePlay() {
    const playBtn = document.querySelector(".btn-play");
    
    if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
        playBtn.innerText = "Play";
        playBtn.style.background = "#2ecc71";
    } else {
        playBtn.innerText = "Pause";
        playBtn.style.background = "#f1c40f";
        playTimer = setInterval(() => {
            if (window.currentStepIdx < window.actionQueue.length - 1) {
                handleNext();
            } else {
                handlePlay(); 
            }
        }, window.animationSpeed);
    }
}

function updateSpeed() {
    const sliderVal = document.getElementById("speed-slider").value;

    window.animationSpeed = (11 - sliderVal) * 150; 

    if (playTimer) {
        clearInterval(playTimer);
        playTimer = setInterval(() => {
            if (window.currentStepIdx < window.actionQueue.length - 1) {
                handleNext();
            } else {
                handlePlay();
            }
        }, window.animationSpeed);
    }
}


async function handleSetSeed() {
    const seed = parseInt(document.getElementById("seed-input").value);
    await callTreapApi('set_seed', 'POST', { seed });
    document.getElementById("status-display").innerText = `Seed set to ${seed}`;
}

async function handleWorstSeed() {
    const res = await callTreapApi('find_worst_seed', 'GET');
    if (res && res.success) {
        document.getElementById("seed-input").value = res.data;
        handleSetSeed();
    }
}

async function handleBuild() {
    const inputVal = document.getElementById("build-vals").value;
    
    const vals = inputVal.split(',')
                         .map(v => parseInt(v.trim()))
                         .filter(v => !isNaN(v));

    if (vals.length === 0) {
        document.getElementById("status-display").innerText = "請輸入有效的數字 (例如: 4,8,7)";
        return;
    }

    const nodesData = vals.map(v => ({ val: v }));

    const res = await callTreapApi('treap_build', 'POST', { nodes: nodesData });

    if (res && res.success) {
        window.actionQueue = res.data; 
        window.currentStepIdx = 0;
        updateFrame();
        document.getElementById("status-display").innerText = `Ready (已建立 ${vals.length} 個節點)`;
    }
}




