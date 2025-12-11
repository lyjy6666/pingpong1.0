// 乒乓球比赛管理系统

// 全局变量
let participants = [];
let tournamentData = {
    directAdvance: [],
    firstRoundGroups: [],
    round16: [],
    round8: [],
    round4: [],
    round2: [],
    winner: null,
    currentRound: 'initial'
};

// 初始化页面
function init() {
    // 初始化参赛选手
    initParticipants();
    // 渲染参赛名单
    renderParticipants();
    // 更新当前阶段
    updateCurrentStage();
}

// 初始化参赛选手
function initParticipants() {
    // 使用提供的同事名单
    const participantNames = [
        '刘硕', '段隆越', '洪嘉禧', '余盈如', '张雅熹', '张志展', 
        '徐亮', '邓强', '刘镕玮', '孙琳', '林昭宇', '何家永', 
        '陈芳', '李盛传', '吴金融', '王海峰', '宫关', '陈雪桦', 
        '胡帅', '彭贵永', '王沁', '肖珊妞', '林生迎', '黄瑞光'
    ];
    
    // 初始化24名参赛选手
    participantNames.forEach((name, index) => {
        participants.push({
            id: index + 1,
            name: name,
            status: 'active'
        });
    });
}

// 渲染参赛名单
function renderParticipants() {
    const container = document.getElementById('participants-list');
    container.innerHTML = '';
    
    participants.forEach((participant, index) => {
        const participantItem = document.createElement('div');
        participantItem.className = 'participant-item';
        participantItem.innerHTML = `
            <div class="participant-info">
                <span class="participant-number">${index + 1}</span>
                <span class="participant-name">${participant.name}</span>
            </div>
            <div class="participant-actions">
                <button class="btn btn-sm" onclick="editParticipant(${participant.id})">编辑</button>
                <button class="btn btn-sm danger" onclick="deleteParticipant(${participant.id})">删除</button>
            </div>
        `;
        container.appendChild(participantItem);
    });
}

// 添加选手
function addParticipant() {
    const name = prompt('请输入选手姓名：');
    if (name && name.trim()) {
        const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
        participants.push({
            id: newId,
            name: name.trim(),
            status: 'active'
        });
        renderParticipants();
    }
}

// 编辑选手
function editParticipant(id) {
    const participant = participants.find(p => p.id === id);
    if (participant) {
        const newName = prompt('请输入新的选手姓名：', participant.name);
        if (newName && newName.trim()) {
            participant.name = newName.trim();
            renderParticipants();
        }
    }
}

// 删除选手
function deleteParticipant(id) {
    if (confirm('确定要删除该选手吗？')) {
        participants = participants.filter(p => p.id !== id);
        renderParticipants();
    }
}

// 显示指定区域
function showSection(sectionId) {
    // 隐藏所有区域
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // 显示指定区域
    document.getElementById(sectionId).classList.add('active');
    
    // 如果显示晋级路线图，重新渲染
    if (sectionId === 'bracket') {
        renderBracket();
    }
    // 如果显示比赛结果，重新渲染
    if (sectionId === 'results') {
        renderCurrentRound();
    }
}

// 初始化抽签
function initDraw() {
    if (participants.length < 24) {
        alert('参赛选手数量不足24名，请先添加足够的选手！');
        return;
    }
    
    // 打乱选手顺序
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // 抽取8名直接晋级选手
    tournamentData.directAdvance = shuffled.slice(0, 8);
    
    // 剩余16名选手两两分组
    const remaining = shuffled.slice(8, 24);
    tournamentData.firstRoundGroups = [];
    for (let i = 0; i < remaining.length; i += 2) {
        tournamentData.firstRoundGroups.push({
            id: i / 2 + 1,
            players: [remaining[i], remaining[i + 1]],
            winner: null
        });
    }
    
    // 渲染抽签结果
    renderDrawResults();
    // 显示抽签页面
    showSection('draw');
}

// 渲染抽签结果
function renderDrawResults() {
    // 渲染直接晋级选手
    const directAdvanceList = document.getElementById('direct-advance-list');
    directAdvanceList.innerHTML = '';
    tournamentData.directAdvance.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'draw-player-item';
        playerItem.innerHTML = `<span class="player-number">${index + 1}</span><span class="player-name">${player.name}</span>`;
        directAdvanceList.appendChild(playerItem);
    });
    
    // 渲染待比赛选手分组
    const matchGroups = document.getElementById('match-groups');
    matchGroups.innerHTML = '';
    tournamentData.firstRoundGroups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = 'match-group';
        groupItem.innerHTML = `
            <div class="group-header">
                <h4>第${group.id}组</h4>
            </div>
            <div class="group-players">
                <div class="group-player">${group.players[0].name}</div>
                <div class="vs">VS</div>
                <div class="group-player">${group.players[1].name}</div>
            </div>
        `;
        matchGroups.appendChild(groupItem);
    });
}

// 重新抽签
function resetDraw() {
    if (confirm('确定要重新抽签吗？当前抽签结果将被清空！')) {
        tournamentData.directAdvance = [];
        tournamentData.firstRoundGroups = [];
        initDraw();
    }
}

// 确认分组
function confirmDraw() {
    if (confirm('确定要确认当前分组吗？确认后将无法修改！')) {
        // 更新当前阶段
        tournamentData.currentRound = 'round1';
        updateCurrentStage();
        // 渲染晋级路线图
        renderBracket();
        // 渲染当前轮次比赛结果
        renderCurrentRound();
        // 显示比赛结果页面
        showSection('results');
    }
}

// 渲染当前轮次比赛结果
function renderCurrentRound() {
    const container = document.getElementById('round-section');
    container.innerHTML = '';
    
    let roundTitle, matches;
    
    switch (tournamentData.currentRound) {
        case 'round1':
            roundTitle = '第一轮：16进8';
            matches = tournamentData.firstRoundGroups;
            break;
        case 'round16':
            roundTitle = '第二轮：16进8';
            matches = tournamentData.round16;
            break;
        case 'round8':
            roundTitle = '第三轮：8进4';
            matches = tournamentData.round8;
            break;
        case 'round4':
            roundTitle = '第四轮：4进2';
            matches = tournamentData.round4;
            break;
        case 'round2':
            roundTitle = '决赛：2进1';
            matches = tournamentData.round2;
            break;
        default:
            roundTitle = '比赛尚未开始';
            matches = [];
    }
    
    const roundHeader = document.createElement('div');
    roundHeader.className = 'round-header';
    roundHeader.innerHTML = `<h3>${roundTitle}</h3>`;
    container.appendChild(roundHeader);
    
    if (matches.length > 0) {
        matches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            
            // 渲染比赛选手
            const playersHtml = match.players.map((player, index) => {
                const isWinner = match.winner && match.winner.id === player.id;
                return `
                    <div class="match-player ${isWinner ? 'winner' : ''}">
                        <span class="player-name">${player.name}</span>
                        ${tournamentData.currentRound !== 'initial' ? `<button class="btn btn-sm primary" onclick="setWinner(${match.id}, ${player.id})">晋级</button>` : ''}
                    </div>
                `;
            }).join('');
            
            matchItem.innerHTML = `
                <div class="match-info">
                    <span class="match-number">第${match.id}场</span>
                </div>
                <div class="match-content">
                    ${playersHtml}
                </div>
            `;
            container.appendChild(matchItem);
        });
        
        // 添加进入下一轮按钮
        if (tournamentData.currentRound !== 'round2') {
            const nextRoundBtn = document.createElement('button');
            nextRoundBtn.className = 'btn primary';
            nextRoundBtn.innerHTML = '进入下一轮';
            nextRoundBtn.onclick = startNextRound;
            nextRoundBtn.disabled = !checkAllMatchesCompleted();
            container.appendChild(nextRoundBtn);
        }
    } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p>当前轮次暂无比赛安排</p>';
        container.appendChild(emptyState);
    }
}

// 设置比赛胜者
function setWinner(matchId, playerId) {
    let matches;
    
    switch (tournamentData.currentRound) {
        case 'round1':
            matches = tournamentData.firstRoundGroups;
            break;
        case 'round16':
            matches = tournamentData.round16;
            break;
        case 'round8':
            matches = tournamentData.round8;
            break;
        case 'round4':
            matches = tournamentData.round4;
            break;
        case 'round2':
            matches = tournamentData.round2;
            break;
        default:
            matches = [];
    }
    
    const match = matches.find(m => m.id === matchId);
    if (match) {
        const winner = match.players.find(p => p.id === playerId);
        if (winner) {
            match.winner = winner;
            renderCurrentRound();
            renderBracket();
        }
    }
}

// 检查当前轮次所有比赛是否已完成
function checkAllMatchesCompleted() {
    let matches;
    
    switch (tournamentData.currentRound) {
        case 'round1':
            matches = tournamentData.firstRoundGroups;
            break;
        case 'round16':
            matches = tournamentData.round16;
            break;
        case 'round8':
            matches = tournamentData.round8;
            break;
        case 'round4':
            matches = tournamentData.round4;
            break;
        case 'round2':
            matches = tournamentData.round2;
            break;
        default:
            return false;
    }
    
    return matches.every(match => match.winner !== null);
}

// 开始下一轮比赛
function startNextRound() {
    if (!checkAllMatchesCompleted()) {
        alert('当前轮次还有未完成的比赛，请先完成所有比赛！');
        return;
    }
    
    // 获取当前轮次的胜者
    let winners = [];
    switch (tournamentData.currentRound) {
        case 'round1':
            // 第一轮胜者 + 直接晋级选手 = 16强
            winners = [...tournamentData.firstRoundGroups.map(group => group.winner), ...tournamentData.directAdvance];
            // 打乱胜者顺序
            winners.sort(() => Math.random() - 0.5);
            // 生成16进8的对阵表
            tournamentData.round16 = [];
            for (let i = 0; i < winners.length; i += 2) {
                tournamentData.round16.push({
                    id: i / 2 + 1,
                    players: [winners[i], winners[i + 1]],
                    winner: null
                });
            }
            // 更新当前阶段
            tournamentData.currentRound = 'round16';
            break;
        case 'round16':
            // 16进8的胜者
            winners = tournamentData.round16.map(match => match.winner);
            // 打乱胜者顺序
            winners.sort(() => Math.random() - 0.5);
            // 生成8进4的对阵表
            tournamentData.round8 = [];
            for (let i = 0; i < winners.length; i += 2) {
                tournamentData.round8.push({
                    id: i / 2 + 1,
                    players: [winners[i], winners[i + 1]],
                    winner: null
                });
            }
            // 更新当前阶段
            tournamentData.currentRound = 'round8';
            break;
        case 'round8':
            // 8进4的胜者
            winners = tournamentData.round8.map(match => match.winner);
            // 打乱胜者顺序
            winners.sort(() => Math.random() - 0.5);
            // 生成4进2的对阵表
            tournamentData.round4 = [];
            for (let i = 0; i < winners.length; i += 2) {
                tournamentData.round4.push({
                    id: i / 2 + 1,
                    players: [winners[i], winners[i + 1]],
                    winner: null
                });
            }
            // 更新当前阶段
            tournamentData.currentRound = 'round4';
            break;
        case 'round4':
            // 4进2的胜者
            winners = tournamentData.round4.map(match => match.winner);
            // 生成决赛对阵表
            tournamentData.round2 = [{
                id: 1,
                players: [winners[0], winners[1]],
                winner: null
            }];
            // 更新当前阶段
            tournamentData.currentRound = 'round2';
            break;
    }
    
    // 更新当前阶段显示
    updateCurrentStage();
    // 重新渲染当前轮次
    renderCurrentRound();
    // 重新渲染晋级路线图
    renderBracket();
}

// 检查当前轮次所有比赛是否已完成
function checkAllMatchesCompleted() {
    let matches;
    
    switch (tournamentData.currentRound) {
        case 'round1':
            matches = tournamentData.firstRoundGroups;
            break;
        case 'round16':
            matches = tournamentData.round16;
            break;
        case 'round8':
            matches = tournamentData.round8;
            break;
        case 'round4':
            matches = tournamentData.round4;
            break;
        case 'round2':
            matches = tournamentData.round2;
            break;
        default:
            return false;
    }
    
    return matches.every(match => match.winner !== null);
}

// 更新当前阶段显示
function updateCurrentStage() {
    const stageNameMap = {
        'initial': '初始阶段',
        'round1': '第一轮（24进8）',
        'round16': '16进8',
        'round8': '8进4',
        'round4': '4进2',
        'round2': '决赛（2进1）'
    };
    const stageName = stageNameMap[tournamentData.currentRound] || '初始阶段';
    document.querySelector('.stage-name').textContent = stageName;
}

// 渲染晋级路线图
function renderBracket() {
    const container = document.getElementById('bracket-container');
    container.innerHTML = '';
    
    // 定义比赛阶段
    const stages = [
        { id: 'round1', name: '第一轮', matches: tournamentData.firstRoundGroups },
        { id: 'round16', name: '16进8', matches: tournamentData.round16 },
        { id: 'round8', name: '8进4', matches: tournamentData.round8 },
        { id: 'round4', name: '4进2', matches: tournamentData.round4 },
        { id: 'round2', name: '决赛', matches: tournamentData.round2 }
    ];
    
    stages.forEach(stage => {
        if (stage.matches.length > 0 || (tournamentData.currentRound >= stage.id && tournamentData.currentRound !== 'initial')) {
            const stageColumn = document.createElement('div');
            stageColumn.className = 'bracket-column';
            
            const stageHeader = document.createElement('div');
            stageHeader.className = 'bracket-column-header';
            stageHeader.innerHTML = `<h4>${stage.name}</h4>`;
            stageColumn.appendChild(stageHeader);
            
            const stageMatches = document.createElement('div');
            stageMatches.className = 'bracket-matches';
            
            if (stage.matches.length > 0) {
                stage.matches.forEach(match => {
                    const matchItem = document.createElement('div');
                    matchItem.className = 'bracket-match';
                    
                    const playersHtml = match.players.map(player => {
                        const isWinner = match.winner && match.winner.id === player.id;
                        return `<div class="bracket-player ${isWinner ? 'winner' : ''}">${player.name}</div>`;
                    }).join('');
                    
                    matchItem.innerHTML = playersHtml;
                    stageMatches.appendChild(matchItem);
                });
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'bracket-placeholder';
                placeholder.innerHTML = '<p>待晋级</p>';
                stageMatches.appendChild(placeholder);
            }
            
            stageColumn.appendChild(stageMatches);
            container.appendChild(stageColumn);
        }
    });
    
    // 如果有冠军，显示冠军信息
    if (tournamentData.round2.length > 0 && tournamentData.round2[0].winner) {
        const winnerColumn = document.createElement('div');
        winnerColumn.className = 'bracket-column';
        
        const winnerHeader = document.createElement('div');
        winnerHeader.className = 'bracket-column-header';
        winnerHeader.innerHTML = '<h4>冠军</h4>';
        winnerColumn.appendChild(winnerHeader);
        
        const winnerItem = document.createElement('div');
        winnerItem.className = 'bracket-winner';
        winnerItem.innerHTML = `<div class="winner-name">${tournamentData.round2[0].winner.name}</div>`;
        winnerColumn.appendChild(winnerItem);
        
        container.appendChild(winnerColumn);
    }
}

// 导出比赛结果
function exportResults() {
    const results = {
        participants: participants,
        tournament: tournamentData,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `乒乓球比赛结果_${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 重置比赛
function resetTournament() {
    if (confirm('确定要重置整个比赛吗？所有比赛数据将被清空！')) {
        // 重置比赛数据
        tournamentData = {
            directAdvance: [],
            firstRoundGroups: [],
            round16: [],
            round8: [],
            round4: [],
            round2: [],
            winner: null,
            currentRound: 'initial'
        };
        // 更新当前阶段
        updateCurrentStage();
        // 渲染参赛名单
        renderParticipants();
        // 显示参赛名单页面
        showSection('participants');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);