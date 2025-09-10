import "./gaming.scss";

const games = [
  { id: 1, name: "Among Us", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg", players: 5, desc: "Game giải trí vui nhộn, phá án cùng bạn bè." },
  { id: 2, name: "Valorant", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/1334020/header.jpg", players: 10, desc: "Bắn súng chiến thuật 5v5 cực hot." },
  { id: 3, name: "Genshin Impact", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg", players: 4, desc: "Phiêu lưu thế giới mở, đồ họa anime đẹp mắt." },
  { id: 4, name: "Liên Quân Mobile", img: "https://static-cdn.jtvnw.net/ttv-boxart/509663-285x380.jpg", players: 10, desc: "MOBA quốc dân, chơi cùng bạn bè mọi lúc." },
];

const Gaming = () => {
  return (
    <div className="gaming-page">
      <h1>Gaming</h1>
      <div className="games-grid">
        {games.map(game => (
          <div className="game-card" key={game.id}>
            <img src={game.img} alt={game.name} />
            <div className="game-info">
              <h3>{game.name}</h3>
              <span className="players">{game.players} người chơi</span>
              <p>{game.desc}</p>
              <button>Chơi ngay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gaming;
