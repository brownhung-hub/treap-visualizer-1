from flask import Flask, request, jsonify, render_template
import treap, worst_seed
from treap import flush_log
import random

app = Flask(__name__)
t = treap.Treap()
def format_response(success, data):
    return jsonify({
        "success": success,
        "data": data
    })

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/api/set_seed', methods=['POST'])
def api_set_seed():
    try:
        req = request.json
        seed = int(req.get('seed'))
        random.seed(seed)
        
        return format_response(True, seed)
    
    except Exception as e:
        return format_response(False, str(e)), 400
    

@app.route('/api/find_worst_seed', methods=['GET'])
def api_find_worst_seed():
    try:
        seed = worst_seed.find_worst_seed()
        return format_response(True, seed)
    
    except Exception as e:
        return format_response(False, str(e)), 500
    

@app.route('/api/treap_insert', methods=['POST'])
def api_treap_insert():
    try:
        req = request.json
        pos = int(req.get('pos'))
        val = int(req.get('val'))
        t.insert(pos, val)
        
        return format_response(True, flush_log())
    
    except Exception as e:
        return format_response(False, str(e)), 400
    

@app.route('/api/treap_remove', methods=['POST'])
def api_treap_remove():
    try:
        req = request.json
        pos = int(req.get('pos'))
        t.remove(pos)

        return format_response(True, flush_log())
    
    except Exception as e:
        return format_response(False, str(e)), 400
    

@app.route('/api/treap_query', methods=['POST'])
def api_treap_query():
    try:
        req = request.json
        l = int(req.get('l'))
        r = int(req.get('r'))
        t.query(l, r)
        
        return format_response(True, flush_log())
    
    except Exception as e:
        return format_response(False, str(e)), 400
    

@app.route('/api/treap_build', methods=['POST'])
def api_treap_build():
    try:
        req = request.json
        nodes = req.get('nodes')
        vals = [n['val'] for n in nodes]
        t.build(vals)
        
        return format_response(True, flush_log())
    
    except Exception as e:
        return format_response(False, str(e)), 400
    
@app.route('/api/treap_clear', methods=['GET'])
def api_treap_clear():
    try:
        t.clear()
        return format_response(True, flush_log())
    
    except Exception as e:
        return format_response(False, str(e)), 500
    
    

if __name__ == '__main__':
    app.run(debug=True)