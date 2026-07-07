const tabsList = document.getElementById("tabsList");

let customGroups = {};
let draggedTab = null;

const groupRules = { 
    "AWS": ["amazon", "aws"],
     "JIRA": ["atlassian", "jira"],
      "GITLAB": ["github", "gitlab", "stackoverflow"],
       "ENTERTAINMENT": ["youtube", "netflix","spotify"],
        "GOOGLE SEARCH": ["google", "flipkart"] 
    };

function closeGroupTabs(tabs) {
    const tabIds = tabs.map(tab => tab.id);
    chrome.tabs.remove(tabIds); 
}

// ✅ UPDATED: supports drag-drop override 
function getGroup(tab) {
    // 👇 priority: custom drag grouping 
    if (customGroups[tab.id]) {
         return customGroups[tab.id]; 
        }

    const url = tab.url?.toLowerCase() || "";
    const title = tab.title?.toLowerCase() || "";
    
    for (let group in groupRules) {
         if (groupRules[group].some(keyword => url.includes(keyword) || title.includes(keyword) )) 
         {
             return group; 
            } 
        }

    return "OTHERS"; 
}

async function loadTabs() {

const tabs = await chrome.tabs.query({ currentWindow: true });

const groupedTabs = {};

// Group tabs 
tabs.forEach(tab => { 
    const group = getGroup(tab);
    if (!groupedTabs[group]) {
      groupedTabs[group] = [];
    }

    groupedTabs[group].push(tab);
});

// Render UI   
tabsList.innerHTML = "";

for (let group in groupedTabs) {

const groupDiv = document.createElement("div");

groupDiv.style.border = "2px dashed #ccc";
groupDiv.style.padding = "8px";
groupDiv.style.marginTop = "10px";

groupDiv.innerHTML = `
  <h4>
    ${group} (${groupedTabs[group].length})
    <button class="closeGroupBtn">Close Group</button>
  </h4>
`;

// ✅ Close group
groupDiv.querySelector(".closeGroupBtn").onclick = () => {

  if (confirm(`Close all tabs in ${group}?`)) {

    closeGroupTabs(groupedTabs[group]);

    groupDiv.remove();

    setTimeout(() => {
      loadTabs();
    }, 300);
  }
};

// ✅ DROP TARGET
// groupDiv.classList.add("group");
groupDiv.addEventListener("dragover", (e) => {
  e.preventDefault();
  groupDiv.style.backgroundColor = "#e6f7ff";
});

groupDiv.addEventListener("dragleave", () => {
  groupDiv.style.backgroundColor = "";
});

groupDiv.addEventListener("drop", () => {

  groupDiv.style.backgroundColor = "";

  if (!draggedTab) return;

  // 👇 Save custom group mapping
  customGroups[draggedTab.id] = group;

  loadTabs();
});

// Tabs inside group
groupedTabs[group].forEach(tab => {

  const div = document.createElement("div");

  div.style.border = "1px solid #ccc";
  div.style.margin = "8px";
  div.style.padding = "8px";
  div.style.cursor = "grab";

  // ✅ MAKE DRAGGABLE
  div.draggable = true;

  div.addEventListener("dragstart", () => {
    draggedTab = tab;
  });

 div.innerHTML = `
<div style ="display: flex;justify-content: space-between; align-items: center;">
<div style="flex: 1; margin-right: 10px;">
  <img src="${tab.favIconUrl}" width="18">
  <strong>${tab.title}</strong><br>
  <small>${(tab.url || "").substring(0, 50)}</small>
</div>

<div style="display: flex; gap: 5px;">
<button class="pinBtn">
${tab.pinned ? "Unpin" : "Pin"} 
</button>
<button class ="closeBtn">Close</button>
</div>
</div>
`; 
// Close 
div.querySelector(".closeBtn").onclick = () => {
     chrome.tabs.remove(tab.id); 
     div.remove(); 
    };
// Pin / Unpin 
div.querySelector(".pinBtn").onclick = () => { 
    chrome.tabs.update(tab.id, { pinned: !tab.pinned }); 
    loadTabs(); // refresh UI 
}; 
if (tab.pinned) {
     div.style.backgroundColor = "#fff7e6"; 
    }

  groupDiv.appendChild(div);
});

tabsList.appendChild(groupDiv);
} 
}

loadTabs();