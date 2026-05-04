const container = document.getElementById('treap-container');
const svg = d3.select("#treap-container").append("svg")
    .attr("width", "100%")
    .attr("height", "100%");
const margin = { top: 60, right: 20, bottom: 20, left: 20 };

window.updateTreap = function(frame) {
    svg.selectAll("*").remove();
    if (!frame || !frame.data) return;

    const roots = frame.data.children || []; // 取得分割後的 Treap 陣列
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;
    const treeWidth = fullWidth / (roots.length || 1);

    roots.forEach((rootData, i) => {
        if (!rootData || rootData.isEmpty) return;

        const hierarchy = d3.hierarchy(rootData, d => {
            const kids = [];
            if (d.left && !d.left.isEmpty) kids.push(d.left);
            if (d.right && !d.right.isEmpty) kids.push(d.right);
            return kids;
        });

        const treeLayout = d3.tree().size([treeWidth - 80, fullHeight - 160]);
        treeLayout(hierarchy);

        const xOffset = i * treeWidth + 40;
        const g = svg.append("g").attr("transform", `translate(${xOffset}, ${margin.top})`);

        g.selectAll(".link")
            .data(hierarchy.links())
            .enter().append("path")
            .attr("fill", "none").attr("stroke", "#dfe6e9").attr("stroke-width", 2.5)
            .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));

        const node = g.selectAll(".node")
            .data(hierarchy.descendants())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        node.append("circle")
            .attr("r", 40)
            .attr("fill", "#fff")
            .attr("stroke", d => d.data.highlight1 ? "#ff7675" : "#74b9ff") // 高亮邏輯
            .attr("stroke-width", 4);

        node.append("text")
            .attr("dy", "0.35em").attr("text-anchor", "middle")
            .style("font-size", "24px").style("font-weight", "bold")
            .text(d => d.data.val);

        node.append("text")
            .attr("dy", "-2.8em").attr("text-anchor", "middle")
            .style("font-size", "10px").attr("fill", "#636e72")
            .text(d => d.data.priority ? `P: ${d.data.priority.toFixed(2)}` : "");
            
        // 渲染 range_max
        if (rootData.range_max !== undefined) {
             node.append("text")
                .attr("dy", "2.8em").attr("text-anchor", "middle")
                .style("font-size", "12px").attr("fill", "#d63031")
                .text(d => `Max: ${d.data.range_max}`);
        }
    });
};
