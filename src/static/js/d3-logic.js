const container = document.getElementById("treap-container");
const svg = d3.select("#treap-container").append("svg").attr("width", "100%").attr("height", "100%");
const zoomG = svg.append("g");
const g = zoomG.append("g");

const initialOffset = container.offsetWidth / 2;
g.attr("transform", `translate(${initialOffset}, -50)`);

const zoom = d3.zoom().on("zoom", (e) => zoomG.attr("transform", e.transform));
svg.call(zoom);

function resetCenter() {
    svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
}

function clearCanvas() { g.selectAll("*").remove(); }

function renderTreap(stepData) {
    if (!stepData || !stepData.data) { clearCanvas(); return; }
    const treeData = stepData.data;

    clearCanvas();

    const width = container.offsetWidth;
    const treeLayout = d3.tree().nodeSize([80, 100]);

    const root = d3.hierarchy(treeData, d => {
        if (!d || d.isEmpty) {
            return null;
        }
        return d.children || [d.left, d.right];
    });

    treeLayout(root);

    g.selectAll(".link")
        .data(root.links().filter(d => 
            d.source.data && d.source.data.node_id !== "vroot" && 
            d.target.data && !d.target.data.isEmpty 
        ))
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#cbd5e0")
        .attr("stroke-width", 2)
        .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));

    const nodes = g.selectAll(".node")
        .data(root.descendants().filter(d =>
            d.data && d.data.node_id !== "vroot" && !d.data.isEmpty 
        ))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodes.append("circle")
        .attr("r", 35)
        .attr("fill", d => d.data.highlight1 ? "#fff3cd" : "#fff") 
        .attr("stroke", d => d.data.highlight2 ? "#e53e3e" : "#3498db")
        .attr("stroke-width", 2);

    // nodes.append("text")
    //     .attr("dy", "-1.8em")
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "10px")
    //     .style("font-weight", "bold")
    //     .text(d => `Val: ${d.data.val}`);

    nodes.append("text")
        .attr("dy", "-1.3em")
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "#718096")
        .text(d => `H: ${d.data.priority || 0}`);

    nodes.append("text")
        .attr("dy", "0.4em")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "900")
        .text(d => d.data.val);

    nodes.append("text")
        .attr("dy", "1.8em")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#e53e3e")
        .text(d => d.data.range_max !== undefined ? `Max: ${d.data.range_max}` : "");

}
