export default class UI {
    constructor(game, grid) {
        this._grid = grid;
        this._game = game;
        this._setupButtons();
        this._currentTimerTipId = 0;
        this._currentMazeIsNotReadyTipId = 0;
    }

    setTime(time) {
        const timer = document.getElementById("timer");
        timer.innerHTML = "";
        const newTime = document.createTextNode(time);
        timer.appendChild(newTime);
    }

    _setupButtons() {
        this._setupAnimateButton();
        this._setupPlayButton();
        this._setupAnimationSpeedButtons();
        this._setVictoryButton();
        this._setDefeatButton();
    }

    _setVictoryButton() {
        const victoryButton = document.getElementById("victory-button");
        victoryButton.addEventListener("click", () => this.confirmVictory());
    }

    _setDefeatButton() {
        const defeatButton = document.getElementById("defeat-button");
        defeatButton.addEventListener("click", () => this.confirmDefeat());
    }

    _setupAnimateButton() {
        const animateButton = document.getElementById("animate");
        animateButton.addEventListener("click", () =>
            this._game.generateMazeAnimated()
        );
    }

    _setupPlayButton() {
        const playButton = document.getElementById("play");
        playButton.addEventListener("click", () => this._game.start());
    }

    _setupAnimationSpeedButtons() {
        const slowButton = document.getElementById("animation-slow");
        const mediumButton = document.getElementById("animation-medium");
        const fastButton = document.getElementById("animation-fast");
        const instantaneousButton = document.getElementById(
            "animation-instantaneous"
        );
        slowButton.addEventListener("click", () => {
            this._grid.setAnimationSpeed("slow");
            this._setCurrentSpeedButton("slow");
        });
        mediumButton.addEventListener("click", () => {
            this._grid.setAnimationSpeed("medium");
            this._setCurrentSpeedButton("medium");
        });
        mediumButton.click();
        fastButton.addEventListener("click", () => {
            this._grid.setAnimationSpeed("fast");
            this._setCurrentSpeedButton("fast");
        });
        instantaneousButton.addEventListener("click", () => {
            this._grid.setAnimationSpeed("instantaneous");
            this._setCurrentSpeedButton("instantaneous");
        });
    }

    _setCurrentSpeedButton(speed) {
        const buttons = {
            slow: document.getElementById("animation-slow"),
            medium: document.getElementById("animation-medium"),
            fast: document.getElementById("animation-fast"),
            instantaneous: document.getElementById("animation-instantaneous"),
        };

        const currentButton = buttons[speed];
        const otherButtons = Object.keys(buttons)
            .filter((key) => key !== speed)
            .map((key) => buttons[key]);

        for (let button of otherButtons) {
            button.classList.remove("current-speed");
        }
        currentButton.classList.add("current-speed");
    }

    showVictoryPopUp() {
        const popUp = document.getElementById("victory-pop-up");
        popUp.classList.remove("hidden");
    }

    confirmVictory() {
        this._hideVictoryPopUp();
        this._game.reset();
    }

    confirmDefeat() {
        this.hideDefeatPopUp();
        this._game.reset();
    }

    _hideVictoryPopUp() {
        const popUp = document.getElementById("victory-pop-up");
        popUp.classList.add("hidden");
    }

    showMazeIsNotReadyTip() {
        this._currentMazeIsNotReadyTipId++;
        const mazeIsNotReadyTipId = this._currentMazeIsNotReadyTipId;

        const mazeIsNotReadyTip = document.getElementById(
            "maze-is-not-ready-tip"
        );
        mazeIsNotReadyTip.classList.remove("hidden");
        setTimeout(() => {
            if (mazeIsNotReadyTipId === this._currentMazeIsNotReadyTipId)
                this.hideMazeIsNotReadyTip();
        }, 3000);
    }

    hideMazeIsNotReadyTip() {
        const mazeIsNotReadyTip = document.getElementById(
            "maze-is-not-ready-tip"
        );
        mazeIsNotReadyTip.classList.add("hidden");
    }

    showTimerTip() {
        this._currentTimerTipId++;
        const timerTipId = this._currentTimerTipId;

        const timerTip = document.getElementById("timer-tip");
        timerTip.classList.remove("hidden");
        setTimeout(() => {
            if (timerTipId === this._currentTimerTipId) this.hideTimerTip();
        }, 5000);
    }

    hideTimerTip() {
        const timerTip = document.getElementById("timer-tip");
        timerTip.classList.add("hidden");
    }

    showDefeatTip() {
        const defeatTip = document.getElementById("defeat-tip");
        defeatTip.classList.remove("hidden");
    }

    hideDefeatTip() {
        const defeatTip = document.getElementById("defeat-tip");
        defeatTip.classList.add("hidden");
    }

    showDefeatPopUp() {
        const defeatPopUp = document.getElementById("defeat-pop-up");
        defeatPopUp.classList.remove("hidden");
    }

    hideDefeatPopUp() {
        const defeatPopUp = document.getElementById("defeat-pop-up");
        defeatPopUp.classList.add("hidden");
    }
}
