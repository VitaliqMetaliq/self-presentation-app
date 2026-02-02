import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'app-rock-paper-scissors-page',
    templateUrl: './rock-paper-scissors.component.html',
    styleUrls: ['./rock-paper-scissors.component.scss'],
    imports: [CommonModule],
    standalone: true,
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RockPaperScissorsComponent {
    private figures = ['rock', 'paper', 'scissors'];
    private storageKey = 'rock-paper-scissors-game-score';

    public figurePicked = signal(false);
    public selectedFigure = signal<string | null>(null);
    public houseChoice = signal<string | null>(null);
    public popupOpen = signal(false);
    public gameScore = 0;

    public gameResult = signal<string | null>(null);

    ngOnInit() {
        const saved = localStorage.getItem(this.storageKey);
        this.gameScore = saved && Number(saved) >= 0 ? Number(saved) : 0;
    }

    public onFigureClick(figure: string) {
        this.figurePicked.set(true);
        this.selectedFigure.set(figure);

        setTimeout(() => {
            const rnd = Math.floor(Math.random() * 3);
            this.houseChoice.set(this.figures[rnd]);

            const res = this.getGameResult(figure, this.figures[rnd]);

            this.gameResult.set(res.result);

            this.gameScore += res.score;
            if (this.gameScore < 0)
                this.gameScore = 0;

            localStorage.setItem(this.storageKey, this.gameScore.toString());
            
        }, 700);
    }

    private getGameResult(player: string, house: string): GameResult {
        switch (true) {
            case player === 'rock' && house === 'scissors':
            case player === 'paper' && house === 'rock':
            case player === 'scissors' && house === 'paper':
                return { score: 1, result: 'YOU WIN' };
            case player === house:
                return { score: 0, result: 'DRAW' };
            default:
                return { score: -1, result: 'YOU LOSE' };
        }
    }

    public onPlayAgainClick() {
        this.figurePicked.set(false);
        this.selectedFigure.set(null);
        this.houseChoice.set(null);
        this.gameResult.set(null);
    }

    public onRulesClick() {
        this.popupOpen.set(true);
    }

    public onClosePopupClick() {
        this.popupOpen.set(false);
    }
}

interface GameResult {
    score: number;
    result: string;
}
