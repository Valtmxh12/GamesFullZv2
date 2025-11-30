import { useParams, Link } from 'react-router-dom';
import { getGameById } from '../data/games';
import { useSEO } from '../hooks/useSEO';
import ImageWithFallback from '../components/ImageWithFallback';

const DetalleJuego = () => {
  const { id } = useParams<{ id: string }>();
  const juego = getGameById(Number(id));

  // Convertir rating de estrellas a número (antes de usar en useSEO)
  const ratingNumber = juego ? (juego.ratingNumber || (juego.rating.match(/⭐/g) || []).length) : 0;

  useSEO({
    title: juego?.nombre || 'Juego no encontrado',
    description: juego?.descripcion || 'Detalles del juego',
    image: juego?.imagen,
    type: juego ? 'article' : 'website',
    gameData: juego ? {
      nombre: juego.nombre,
      rating: ratingNumber,
      categoria: juego.categoria,
      tamaño: juego.tamaño,
    } : undefined,
  });

  if (!juego) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 font-pixel text-white">Juego no encontrado</h1>
          <Link to="/juegos" className="text-neon-blue hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }
  const ratingDecimal = ratingNumber * 1.6; // Convertir 1-5 a 0-8 escala

  // Generar tags desde categoría y nombre
  const tags = juego.categoria ? [juego.categoria] : [];
  const nombreWords = juego.nombre.toLowerCase().split(' ');
  if (nombreWords.includes('2025') || nombreWords.includes('2024')) {
    tags.push('2025');
  }
  if (nombreWords.some(w => ['fps', 'shooter', 'disparos'].includes(w))) {
    tags.push('FPS');
  }
  if (nombreWords.some(w => ['guerra', 'war', 'battlefield', 'call of duty'].includes(w))) {
    tags.push('Guerra');
  }

  // Simular ratings individuales basados en el rating general
  const gameplay = ratingDecimal + (Math.random() * 0.6 - 0.3);
  const graficos = ratingDecimal + (Math.random() * 0.6 - 0.3);
  const historia = ratingDecimal + (Math.random() * 0.6 - 0.3);

  // Simular views y downloads si no existen
  const views = Math.floor((juego.downloads || 0) * 3.8);
  const downloads = juego.downloads || 0;

  // Convertir comments a reseñas con formato
  const reseñas = juego.comments.map((comment, index) => ({
    usuario: `Usuario${index + 1}`,
    fecha: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    gameplay: Math.min(10, Math.max(5, gameplay + (Math.random() * 2 - 1))),
    graficos: Math.min(10, Math.max(5, graficos + (Math.random() * 2 - 1))),
    historia: Math.min(10, Math.max(5, historia + (Math.random() * 2 - 1))),
    comentario: comment
  }));

  // Extraer información técnica de requisitos
  const parseRequisitos = (req: string) => {
    const lines = req.split('<br>');
    const result: any = {};
    lines.forEach(line => {
      if (line.includes('SO:')) result.so = line.replace('SO:', '').trim();
      if (line.includes('Procesador:')) result.procesador = line.replace('Procesador:', '').trim();
      if (line.includes('Memoria:') || line.includes('RAM:')) result.memoria = line.replace(/Memoria:|RAM:/, '').trim();
      if (line.includes('Gráficos:')) result.graficos = line.replace('Gráficos:', '').trim();
      if (line.includes('DirectX:')) result.directx = line.replace('DirectX:', '').trim();
      if (line.includes('Almacenamiento:') || line.includes('espacio')) {
        const match = line.match(/(\d+(?:\.\d+)?)\s*GB/i);
        if (match) result.disco = `${match[1]} GB`;
      }
    });
    return result;
  };

  const requisitosMin = parseRequisitos(juego.requisitos);
  const requisitosRec = parseRequisitos(juego.requisitos);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link to="/" className="hover:text-neon-blue transition-colors">Home</Link>
          <span>/</span>
          <Link to="/juegos" className="hover:text-neon-blue transition-colors">Juegos</Link>
          <span>/</span>
          <span className="text-white">{juego.nombre}</span>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden border border-white/10">
          <div className="relative h-[500px]">
            <ImageWithFallback
              src={juego.imagen}
              alt={juego.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
            
            {/* Views and Downloads */}
            <div className="absolute top-6 left-6 flex gap-4">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-neon-blue font-bold">VIS</span>
                <span className="text-white font-bold">{views.toLocaleString()}</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-neon-green font-bold">DL</span>
                <span className="text-white font-bold">{downloads.toLocaleString()}</span>
              </div>
            </div>

            {/* Game Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-5xl md:text-6xl font-black text-white font-pixel mb-4 drop-shadow-2xl">
                {juego.nombre.toUpperCase()}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating Section */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl font-black text-white">{ratingDecimal.toFixed(1)}</div>
                    <div className="flex flex-col">
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-2xl ${i < Math.floor(ratingNumber) ? 'text-yellow-400' : 'text-gray-600'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-text-muted text-sm">({juego.comments.length} votos)</span>
                    </div>
                  </div>
                  
                  {/* Individual Ratings */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary text-sm">Gameplay</span>
                        <span className="text-white font-bold">{gameplay.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-green rounded-full" style={{ width: `${gameplay * 10}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary text-sm">Gráficos</span>
                        <span className="text-white font-bold">{graficos.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue rounded-full" style={{ width: `${graficos * 10}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary text-sm">Historia</span>
                        <span className="text-white font-bold">{historia.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-purple rounded-full" style={{ width: `${historia * 10}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-3 bg-neon-blue/20 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue hover:text-black transition-all font-pixel text-xs">
                  + Inicia sesión para valorar
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 font-pixel">Descripción</h2>
              <p className="text-text-secondary leading-relaxed text-lg">
                {juego.descripcion || 'Sin descripción disponible.'}
              </p>
              
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue rounded-full text-xs font-bold uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Specs */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 font-pixel">Especificaciones Técnicas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-text-muted text-sm">Lanzamiento</span>
                  <p className="text-white font-bold">2025</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Actualización</span>
                  <p className="text-white font-bold">Reciente</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Versión</span>
                  <p className="text-white font-bold">v1.0</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Tamaño</span>
                  <p className="text-white font-bold">{juego.tamaño || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Release</span>
                  <p className="text-white font-bold">Elamigos</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Crack</span>
                  <p className="text-white font-bold">Rune</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Idioma (audios)</span>
                  <p className="text-white font-bold">Español, Inglés</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Idioma (textos)</span>
                  <p className="text-white font-bold">Español, Inglés</p>
                </div>
              </div>
            </div>

            {/* DLCs */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 font-pixel">DLCs Incluidos</h3>
              <p className="text-text-secondary">- No contiene DLCs</p>
            </div>

            {/* Requirements */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 font-pixel">Requisitos del Sistema</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-blue mb-4 font-pixel">Mínimos</h3>
                  <div className="space-y-3 text-sm">
                    {requisitosMin.so && (
                      <div>
                        <span className="text-text-muted">SO:</span>
                        <p className="text-white">{requisitosMin.so}</p>
                      </div>
                    )}
                    {requisitosMin.procesador && (
                      <div>
                        <span className="text-text-muted">Procesador:</span>
                        <p className="text-white">{requisitosMin.procesador}</p>
                      </div>
                    )}
                    {requisitosMin.memoria && (
                      <div>
                        <span className="text-text-muted">Memoria:</span>
                        <p className="text-white">{requisitosMin.memoria}</p>
                      </div>
                    )}
                    {requisitosMin.graficos && (
                      <div>
                        <span className="text-text-muted">Gráficos:</span>
                        <p className="text-white">{requisitosMin.graficos}</p>
                      </div>
                    )}
                    {requisitosMin.directx && (
                      <div>
                        <span className="text-text-muted">DirectX:</span>
                        <p className="text-white">{requisitosMin.directx}</p>
                      </div>
                    )}
                    {requisitosMin.disco && (
                      <div>
                        <span className="text-text-muted">Disco:</span>
                        <p className="text-white">{requisitosMin.disco}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-4 font-pixel">Recomendados</h3>
                  <div className="space-y-3 text-sm">
                    {requisitosRec.so && (
                      <div>
                        <span className="text-text-muted">SO:</span>
                        <p className="text-white">{requisitosRec.so}</p>
                      </div>
                    )}
                    {requisitosRec.procesador && (
                      <div>
                        <span className="text-text-muted">Procesador:</span>
                        <p className="text-white">{requisitosRec.procesador}</p>
                      </div>
                    )}
                    {requisitosRec.memoria && (
                      <div>
                        <span className="text-text-muted">Memoria:</span>
                        <p className="text-white">{requisitosRec.memoria}</p>
                      </div>
                    )}
                    {requisitosRec.graficos && (
                      <div>
                        <span className="text-text-muted">Gráficos:</span>
                        <p className="text-white">{requisitosRec.graficos}</p>
                      </div>
                    )}
                    {requisitosRec.directx && (
                      <div>
                        <span className="text-text-muted">DirectX:</span>
                        <p className="text-white">{requisitosRec.directx}</p>
                      </div>
                    )}
                    {requisitosRec.disco && (
                      <div>
                        <span className="text-text-muted">Disco:</span>
                        <p className="text-white">{requisitosRec.disco}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reseñas.length > 0 && (
              <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neon-green font-pixel">Reseñas y Puntuación</h2>
                  <button className="px-4 py-2 bg-neon-blue/20 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue hover:text-black transition-all font-pixel text-xs">
                    + Inicia sesión para valorar
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reseñas.slice(0, 3).map((reseña, index) => (
                    <div key={index} className="bg-bg-tertiary border border-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-neon-blue/20 rounded-full flex items-center justify-center text-neon-blue font-bold">
                          {reseña.usuario[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{reseña.usuario}</p>
                          <p className="text-text-muted text-xs">{reseña.fecha}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-text-secondary text-xs">Gameplay</span>
                            <span className="text-white text-xs font-bold">{reseña.gameplay.toFixed(1)}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-green rounded-full" style={{ width: `${reseña.gameplay * 10}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-text-secondary text-xs">Gráficos</span>
                            <span className="text-white text-xs font-bold">{reseña.graficos.toFixed(1)}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-blue rounded-full" style={{ width: `${reseña.graficos * 10}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-text-secondary text-xs">Historia</span>
                            <span className="text-white text-xs font-bold">{reseña.historia.toFixed(1)}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-purple rounded-full" style={{ width: `${reseña.historia * 10}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mb-2">{reseña.comentario}</p>
                      <button className="text-neon-blue text-xs hover:underline">Ver todo</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                {juego.links?.direct && (
                  <a
                    href={juego.links.direct}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-neon-green text-black font-bold font-pixel text-center rounded-lg hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,148,0.4)] transition-all"
                  >
                    Comprar
                  </a>
                )}
                {juego.links?.mediafire && (
                  <a
                    href={juego.links.mediafire}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-neon-blue text-black font-bold font-pixel text-center rounded-lg hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                  >
                    Descargar
                  </a>
                )}
              </div>

              {juego.password && (
                <div className="mb-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Contraseña:</p>
                  <p className="text-neon-green font-bold font-mono">{juego.password}</p>
                </div>
              )}

              {juego.advertencia && (
                <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
                  <p className="text-neon-pink text-sm">ADVERTENCIA: {juego.advertencia}</p>
                </div>
              )}

              {juego.note && (
                <div className="mb-4 p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                  <p className="text-neon-blue text-sm">NOTA: {juego.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleJuego;
