"use client"
import { Game, Team, TeamWins } from "./types";

const GAMES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzvvZGyRaBCf-sVVGvmiAC_rAoxgiQ5mmWHsU616tPIVrjmILEa6nrUmQm4UZrKMGztHkWsGR0VgZ8/pub?gid=0&single=true&output=tsv';

const players: string[] = [ 
    "Achinthya", "Agneya", "Alex Chai", "Alex Sin", "Allison", "Ash", "Atiq", "Ben", "Casey", "Chase", "Christine", "Constance", "David", "Devin", "Eugene", "Frank", "Fred", "Grace", "Isabel", "Jackie", "Jainam", "Jaiveer", "Jeff", "Jiwan", "Jordan", "Junseo", "Justine", "Margot", "Ray", "Solaine", "Soob", "William",
];

const teams: Team[] = [
    { name: "Blood, Sets, and Tears", color: "red" },
    { name: "bruh, i'm so drunk", color: "black" },
    { name: "Team 3", color: "white" },
    { name: "Team 4", color: "blue" },
];

async function loadTSVData(url: string, ignoreHeader: boolean = true) {
    // Use fetch to get the CSV data
    const results = await fetch(url);
    const csvData = await results.text();

    // Get the rows from the CSV data
    const rows = csvData.split('\n');

    // Get the last updated time stamp
    // This the last element in the header row
    const lastUpdated = rows[0].split('\t').pop() || "";

    if (ignoreHeader) {
        // Ignore the first row (header)
        rows.shift();
    }

    return { rows, lastUpdated };
}

function getSetScore(score: string): number {
    return parseInt(score) || 0;
}

function mapGamesTSVToGames(csvData: string[]): Game[] {
    const games: { [id: number]: Game } = {};
    for (let i = 0; i < csvData.length; i += 1) {
        try {
            const [id, round, time, court, format, notes, t1_name, t1_players, t1_score, t2_name, t2_players, t2_score, referees] = csvData[i].split('\t');

            const gameId = parseInt(id);
            const courtNumber = parseInt(court);
            const team1Players = t1_players.split(",");
            const team2Players = t2_players.split(",")
            const refs = referees.split(",").filter((ref: string) => ref.trim() !== "");

            const gameSet = {
                team1Score: getSetScore(t1_score),
                team2Score: getSetScore(t2_score),
            };

            if (!games[gameId]) {
                games[gameId] = {
                    id: gameId,
                    team1Name: t1_name,
                    team2Name: t2_name,
                    team1Players,
                    team2Players,
                    sets: [gameSet],
                    court: courtNumber,
                    format,
                    time,
                    notes,
                    refs,
                };
            } else {
                games[gameId].sets.push(gameSet);
            }
        } catch (e) {
            console.error("Error parsing game data", e);
        }
    }

    return Object.values(games);
}

export async function getGames() {
    const { rows: csvData, lastUpdated } = await loadTSVData(GAMES_CSV_URL);
    return { games: mapGamesTSVToGames(csvData), lastUpdated };
}

export async function getGamesFor(player: string) {
    const { rows: csvData, lastUpdated } = await loadTSVData(GAMES_CSV_URL);
    const games = mapGamesTSVToGames(csvData).filter(game => game.team1Players.includes(player) || game.team2Players.includes(player) || game.refs.includes(player));
    return { games, lastUpdated };
}

export function getTeamWins(games: Game[]): TeamWins[] {
    const teamWins: { [teamName: string]: TeamWins } = teams.reduce((acc, team) => {
        acc[team.name] = { name: team.name, color: team.color, wins: 0 };
        return acc;
    }, {} as { [teamName: string]: TeamWins });

    // Sum up the number of set wins for each team
    for (const game of games) {
        const { team1Name, team2Name } = game;
        for (const set of game.sets) {
            if (set.team1Score !== 0 || set.team2Score !== 0) {
                const winningTeam = set.team1Score > set.team2Score ? team1Name : team2Name;
                teamWins[winningTeam].wins += 1;
            }
        }
    }

    return Object.values(teamWins);
}

export function getPlayers(): string[] {
    return players.sort();
}

export function getTeams(): Team[] {
    return teams;
}