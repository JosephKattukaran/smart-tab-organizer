async function analyzeTabs() {
    const tabs = await chrome.tabs.query({});

    tabs.forEach(tab => {

        const url = tab.url?.toLowerCase() || "";
        const title = tab.title?.toLowerCase() || "";

        console.log("URL:", url);
        console.log("Title:", title);

    if (url.includes("youtube")) {
        console.log("Entertainment tab");
    }
    });
}