
# Implicit Treap Visualization Tool

## 📖 Project Overview
This project is an interactive visualization tool for an **Implicit Treap** (a Treap based on relative positions rather than explicit keys). It allows users to dynamically build, modify, and query the data structure while observing real-time animations of the underlying algorithmic processes, such as `Split` and `Merge`.

---

## 🚀 How to Use the Program
<img width="1403" height="703" alt="Screenshot 2026-05-18 at 12 44 58 PM" src="https://github.com/user-attachments/assets/4fe49895-fc33-4c95-bbfc-85b66e6f31e3" />

The user interface is designed to be intuitive. Users interact with the Treap using 1-based positions, mimicking standard array operations but with $O(\log n)$ efficiency.

1. **Initialization:** 
   * Input an initial array and click `Build Treap` to generate the starting structure.
   * Toggle `RANDOM SEED` to observe how different priorities affect the tree's shape. Use `Find Worst Seed` to force the Treap into a degenerate line, illustrating the necessity of randomization.
2. **Modifications (Insert & Remove):** 
   * **Insert:** Enter a `VAL` and a `POSITION`. The animation will show the tree splitting at the target position, inserting the new node, and merging back.
   * **Remove:** Enter a `POSITION` to delete a specific node.
3. **Range Queries:** 
   * Enter a range `L ~ R` and click `Query Range`. The corresponding subtree will be highlighted (`highlight: true`), demonstrating how the system extracts $O(1)$ range information from the root of the split subtree.
4. **Animation Controls:** 
   * Use `Play`, `Step Next`, `Step Back`, and the `Speed` slider to carefully observe the structural changes.

---

## 🧠 How the DSA Works (Algorithm Logic)

<img width="507" height="350" alt="Screenshot 2026-05-18 at 12 48 35 PM" src="https://github.com/user-attachments/assets/8dc2d980-079a-4c70-8f6e-f5b428807507" />

Unlike a standard Binary Search Tree (BST) that sorts by values, an **Implicit Treap** uses the **In-order Traversal** to represent the sequence of the array. The value of a node does not dictate its position in the tree.

### Core Properties
* **Heap Property (Vertical):** Every node possesses a randomly generated `priority`. The tree strictly maintains a Max-Heap structure based on this priority to keep the tree balanced.
* **Size-based Navigation (Horizontal):** Since we insert by position, each node maintains a `size` attribute (the number of nodes in its subtree). The algorithm uses `size` to navigate to the $k$-th element.
* **Range Aggregation:** Each node maintains a `range_max` attribute, representing the maximum value within its subtree. This allows $O(\log n)$ range queries.

### Core Operations: Split & Merge
All modifications (Insert/Remove) and Queries are built upon two fundamental operations:
1. **Split(node, k):** Recursively divides the Treap into two separate trees: Tree A (elements $1 \dots k$) and Tree B (elements $k+1 \dots \text{end}$).
2. **Merge(left, right):** Combines two trees back together, using their `priority` to determine which node becomes the new root, ensuring the Max-Heap property is preserved.

**Example: `treap_query(L, R)`**
To query a range $[L, R]$, the algorithm:
1. Splits the tree into `Left` (1 to L-1) and `Temp` (L to end).
2. Splits `Temp` into `Target` (L to R) and `Right` (R+1 to end).
3. The answer is simply the `range_max` of the `Target` tree's root.
4. Merges the three parts back together.

---

## 💻 System Architecture & Implementation

### Frontend Structure
* `index.html`: Main entry point and UI layout.
* `app.js`: Handles event listeners, API requests to the Flask backend, and controls the animation playback timeline (Steps array).
* `d3-logic.js`: Contains the core rendering logic using D3.js. Modifies SVG elements based on the parsed JSON states.
* `style.css`: UI styling and node transition animations.

### Rendering Tricks & Object Constancy (D3.js)
To ensure smooth animations without flickering, the frontend and backend adhere to specific rendering protocols:
* **Object Constancy (`node_id`):** The backend generates a unique `node_id` for every node. The frontend uses this ID to track nodes across frames, allowing D3 to animate movements smoothly rather than redrawing them.
* **Virtual Root (`isVirtual: true`):** Operations like `Split` result in a forest (multiple disconnected trees). The backend wraps these trees under a hidden "Virtual Root" so the frontend always receives a single valid tree structure to parse.
* **Dummy Nodes (`isEmpty: true`):** In standard D3 tree layouts, a node with only one child is drawn directly below its parent. To maintain the visual characteristics of a binary tree (distinguishing left vs. right children), the backend injects an invisible dummy node (`isEmpty: true`) if a child is missing.

### Backend API Design (Flask -> Frontend)
The Flask backend provides several endpoints, returning step-by-step animation states in JSON format: `{"success": true, "data": ...}`

* `set_seed(seed)`: Sets the PRNG seed (Default: 48763).
* `find_worst_seed()`: Returns a seed causing the worst-case time complexity.
* `treap_build(nodes)`: Initializes the tree and returns the creation steps.
* `treap_insert(pos, id, val)`: Returns a list of steps (`Split` -> `Add` -> `Merge`).
* `treap_remove(pos)`: Returns steps to remove the node at `pos`.
* `treap_query(l, r)`: Returns steps to isolate the range, with the answer contained in the `name` field of the step.

#### JSON Data Format Example
```json
{
  "isVirtual": true,
  "node_id": "vroot",
  "children": [
    {
      "node_id": "n_50",
      "val": 50,
      "priority": 0.92,
      "range_max": 80,
      "highlight": true,
      "left": {
        "node_id": "n_20",
        "val": 20,
        "priority": 0.85,
        "range_max": 20
      },
      "right": {
        "node_id": "n_80_R_null",
        "isEmpty": true 
      }
    }
  ]
}
