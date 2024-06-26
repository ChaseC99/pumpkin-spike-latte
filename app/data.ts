import { Game } from "./types";

const GAMES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSBfiM_nil5SCqieFb4JldxvmGB6MPvdM-CeQrXKw6jiJmtTHhVvOGhHe33vralOC9hddRo9whadvwQ/pub?gid=1316465651&single=true&output=csv';
const STATS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSBfiM_nil5SCqieFb4JldxvmGB6MPvdM-CeQrXKw6jiJmtTHhVvOGhHe33vralOC9hddRo9whadvwQ/pub?gid=586711085&single=true&output=csv';

const players: string[] = [
    "Alex", "Allison", "Ash", "Ben", "Cecilia", "Chase", "Colina", "Constance", "David", "Devin", "Edward", "Eugene", "Frank", "Garrick", "Grace", "Isabel", "Jackie", "Jaiveer", "Jeff", "Juan", "Justine", "Ray", "Susan", "Tara", "Tyler", "Will",
];


async function loadCSVData(url: string, ignoreHeader: boolean = true) {
    // Use fetch to get the CSV data
    const results = await fetch(url);
    const csvData = await results.text();
    
    // Get the rows from the CSV data
    const rows = csvData.split('\n');

    // Get the last updated time stamp
    // This the last element in the header row
    const lastUpdated = rows[0].split(',').pop();

    if (ignoreHeader) {
        // Ignore the first row (header)
        rows.shift();
    }

    return {rows, lastUpdated};
}

function getSetScore(score: string): number {
    return parseInt(score) || 0;
}

function mapGamesCSVToGames(csvData: string[]): Game[] {
    // Each 2 rows represent a game
    // The CSV data is formatted as follows:
    //  time, court, team name, player1, player2, player3, player4, set1 score, set2 score
    // 
    // Example:
    //  10:15,1,Digma Balls,Erik,Constance,Cole,Alex S,13,17
    //  10:15,,Calm Yo Tips,Hoang,Kristi,Chase,Colina,21,21

    const games: Game[] = [];
    for (let i = 0; i < csvData.length; i += 2) {
        const [time, court, team1Name, t1_player1, t1_player2, t1_player3, t1_player4, t1_set1, t1_set2] = csvData[i].split(',');
        const [, , team2Name, t2_player1, t2_player2, t2_player3, t2_player4, t2_set1, t2_set2] = csvData[i + 1].split(',');
        
        const team1Players = [t1_player1, t1_player2, t1_player3, t1_player4].filter(player => player !== '');
        const team2Players = [t2_player1, t2_player2, t2_player3, t2_player4].filter(player => player !== '');
        const sets = [
            { team1Score: getSetScore(t1_set1), team2Score: getSetScore(t2_set1) },
            { team1Score: getSetScore(t1_set2), team2Score: getSetScore(t2_set2) }
        ]
        
        games.push({
            team1Players,
            team1Name,
            team2Players,
            team2Name,
            sets,
            court: parseInt(court),
            time
        });
    }

    return games;
}

export async function getGames() {
    const {rows: csvData, lastUpdated} = await loadCSVData(GAMES_CSV_URL);
    return {games: mapGamesCSVToGames(csvData), lastUpdated};
}

export async function getGamesFor(player: string) {
    const {rows: csvData, lastUpdated} = await loadCSVData(GAMES_CSV_URL);
    const games = mapGamesCSVToGames(csvData).filter(game => game.team1Players.includes(player) || game.team2Players.includes(player));
    return {games, lastUpdated};
}

export async function getTeamScores(): Promise<{ [team: string]: number }> {    
    // Return mock data for now
    return {
        "Team One": 0,
        "Team Two": 0,
    };
}

export async function getPlayers(): Promise<string[]> {
    return players;
}