export default class Loop {
    #action: (() => void) | null;
    #isRunning: boolean;
    #delay?: number;

    constructor(action: () => void, delay?: number) {
        this.#action = action;
        this.#isRunning = false;
        this.#delay = delay;
    }

    start() {
        this.#isRunning = true;
        this.#loop();
    }

    stop() {
        this.#isRunning = false;
    }

    dispose() {
        this.#action = null;
    }

    async #loop() {
        if (!this.#isRunning) {
            return;
        }
        if (this.#action) {
            this.#action();
        }

        if (this.#delay !== undefined) {
            await new Promise((resolve) => setTimeout(resolve, this.#delay));
        }

        requestAnimationFrame(async () => await this.#loop());
    }
}