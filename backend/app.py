from flask import Flask, render_template, jsonify, request, redirect, session
import random
import os

# -------------------------
# Flask App Configuration
# -------------------------
app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)

app.secret_key = "surveillance_rover_secret"

# -------------------------
# In-memory storage (Demo)
# -------------------------
users = {}  # username : password

state = {
    "moving": False
}

# -------------------------
# AUTHENTICATION ROUTES
# -------------------------

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if username in users:
            return render_template("register.html", message="User already exists")

        users[username] = password
        return redirect("/login")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if username in users and users[username] == password:
            session["user"] = username
            return redirect("/")
        else:
            return render_template("login.html", error="Invalid username or password")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/login")


# -------------------------
# PROTECTED DASHBOARD
# -------------------------

@app.route("/")
def home():
    if "user" not in session:
        return redirect("/login")
    return render_template("index.html")


# -------------------------
# ROVER CONTROL ROUTES
# -------------------------

@app.route("/move")
def move():
    state["moving"] = True
    return jsonify({"status": "moving"})


@app.route("/stop")
def stop():
    state["moving"] = False
    return jsonify({"status": "stopped"})


@app.route("/scan")
def scan():
    # Scan should ALWAYS work (even after stop)
    return jsonify({
        "motion": random.choice(["DETECTED", "Clear"]),
        "fire": random.choice(["DETECTED", "Clear"]),
        "co": random.randint(50, 300)
    })


# -------------------------
# RUN SERVER
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
