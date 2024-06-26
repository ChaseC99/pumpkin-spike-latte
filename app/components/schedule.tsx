import GamesList from "../components/games-list";
import { getGames } from "../data";

export default async function Schedule() {
    const {games, lastUpdated} = await getGames();
    
    return (
        <div style={{padding: "0 8px"}}>
            <GamesList games={games} />
            {
                lastUpdated && (
                    <div style={{color: "lightgray", textAlign: "center", marginTop: 24}}>
                        Last updated: {lastUpdated}
                    </div>
                )
            }
        </div>
    );
}