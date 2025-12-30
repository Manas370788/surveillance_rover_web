from flask import Flask, render_template, jsonify
import random

app = Flask(__name__, template_folder="../frontend/templates",
            static_folder="../frontend/static")

state = {
    "moving": False,
    "scanning": False
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/move")
def move():
    state["moving"] = True
    state["scanning"] = True
    return jsonify({"status": "moving"})

@app.route("/stop")
def stop():
    state["moving"] = False
    state["scanning"] = False
    return jsonify({"status": "stopped"})

@app.route("/scan")
def scan():
    if not state["scanning"]:
        return jsonify({"active": False})

    return jsonify({
        "active": True,
        "motion": random.choice(["DETECTED", "Clear"]),
        "fire": random.choice(["DETECTED", "Clear"]),
        "co": random.randint(50, 300)
    })

app.run(debug=True)