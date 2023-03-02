export default class Timer {
    constructor(UI, initialTime = 60) {
        this.UI = UI;
        this.initialTime = initialTime;
        this.time = this.initialTime;
        this.currentCountingId = 0;
        this._setup();
    }

    _setup() {
        this.isRunning = true;
        this.UI.setTime(this.time);
        this.currentCountingId++;
    }

    _updateTime(countingId) {
        setTimeout(() => {
            if (!this.isRunning) return;
            if (countingId === this.currentCountingId) {
                this.time--;
                this.UI.setTime(this.time);
                this._updateTime(countingId);
            }
        }, 1000);
    }

    start() {
        this.UI.showTimerTip();
        this._setup();
        const countingId = this.currentCountingId;
        this._updateTime(countingId);
    }

    stop() {
        this.isRunning = false;
        this.UI.hideTimerTip();
    }

    restart() {
        this.isRunning = true;
        this.start();
    }

    reset() {
        this.time = this.initialTime;
        this.UI.setTime(this.time);
        this.UI.hideTimerTip();
    }
}
