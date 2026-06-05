// Catálogo de 20 plantas reales.
// Separado de seedPlants() para facilitar mantenimiento.
// sprite_key: identificador estable para imágenes y búsquedas.
const PLANT_CATALOG = [
  // ── FÁCIL ──────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Pothos',
    nombre_cientifico: 'Epipremnum aureum',
    tipo_planta: 'ORNAMENTAL',       // ✅ corregido
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Una de las plantas de interior más resistentes del mundo. Tolera poca luz, olvidos de riego y condiciones adversas. Purifica el aire eliminando formaldehído y monóxido de carbono. Sus tallos colgantes pueden alcanzar varios metros.',
    sprite_key: 'pothos'
  },
  {
    nombre_planta: 'Sansevieria',
    nombre_cientifico: 'Dracaena trifasciata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 14,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Conocida como "lengua de suegra" o "planta serpiente". Prácticamente indestructible: sobrevive en sombra, calor y sequía. Es una de las mejores purificadoras de aire según la NASA. Convierte CO₂ en oxígeno incluso de noche.',
    sprite_key: 'sansevieria'
  },
  {
    nombre_planta: 'Echeveria',
    nombre_cientifico: 'Echeveria elegans',
    tipo_planta: 'SUCULENTA',        // ✅ corregido
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 14,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Suculenta en forma de rosa, nativa de México. Almacena agua en sus hojas carnosas y soporta períodos de sequía. Necesita luz solar directa y riego escaso. Es sensible al exceso de agua, que pudre sus raíces rápidamente.',
    sprite_key: 'echeveria'
  },
  {
    nombre_planta: 'Cactus',
    nombre_cientifico: 'Mammillaria elongata',
    tipo_planta: 'CACTUS',           // ✅ corregido (categoría propia)
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 21,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Cactus columnares agrupados con espinas doradas, originario de México. Extremadamente tolerante a la sequía y al calor. Puede pasar semanas sin agua. En primavera produce pequeñas flores blancas o amarillas. Ideal para principiantes.',
    sprite_key: 'cactus'
  },
  {
    nombre_planta: 'Dracena',
    nombre_cientifico: 'Dracaena marginata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 10,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Árbol tropical esbelto con hojas largas bordeadas en rojo o rosa. Muy tolerante a la poca luz y al descuido. Purifica el aire eliminando benceno y tricloroetileno. Crece lentamente y puede vivir décadas con cuidados mínimos.',
    sprite_key: 'dracena'
  },

  // ── MEDIO ──────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Helecho',
    nombre_cientifico: 'Nephrolepis exaltata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'SOMBRA',
    frecuencia_riego: 3,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'El helecho de Boston es uno de los más populares de interior. Necesita humedad constante: si el aire es seco, sus hojas se vuelven marrones. Ideal para baños o cocinas. Es excelente purificador de aire y humidificador natural.',
    sprite_key: 'helecho'
  },
  {
    nombre_planta: 'Begonia',
    nombre_cientifico: 'Begonia rex',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 4,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Famosa por sus hojas ornamentales con patrones metálicos en rojo, plata y verde. No tolera el sol directo ni el sustrato encharcado. Prefiere luz indirecta brillante y riego cuando la superficie del sustrato esté seca al tacto.',
    sprite_key: 'begonia'
  },
  {
    nombre_planta: 'Tradescantia',
    nombre_cientifico: 'Tradescantia zebrina',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Planta colgante de rayas plateadas y envés morado. Crece muy rápido y necesita poda frecuente para mantener su forma compacta. Tolera algo de sequía pero prefiere humedad moderada. Es fácil de propagar: basta un tallo en agua.',
    sprite_key: 'tradescantia'
  },
  {
    nombre_planta: 'Croton',
    nombre_cientifico: 'Codiaeum variegatum',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Planta tropical de colores espectaculares: hojas con manchas amarillas, rojas, naranjas y verdes. Necesita mucha luz para mantener su colorido. Es sensible a los cambios de ubicación y al frío. Pierde hojas si se mueve frecuentemente.',
    sprite_key: 'croton'
  },
  {
    nombre_planta: 'Calathea',
    nombre_cientifico: 'Calathea ornata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'SOMBRA',
    frecuencia_riego: 4,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'NUNCA',
    descripcion: 'Conocida como "planta oración" porque cierra sus hojas de noche. Sus hojas verde oscuro con líneas rosadas son inconfundibles. Necesita humedad alta, agua sin cloro y temperatura constante. No tolera corrientes de aire ni luz directa.',
    sprite_key: 'calathea'
  },

  // ── DIFÍCIL ────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Hibisco',
    nombre_cientifico: 'Hibiscus rosa-sinensis',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Arbusto tropical con flores grandes en rojo, rosa, amarillo y naranja. Necesita mucho sol y riego frecuente en verano. La poda tras cada floración estimula nuevas flores. Es sensible al frío y a la sequía. Sus flores duran solo un día.',
    sprite_key: 'hibisco'
  },
  {
    nombre_planta: 'Petunia',
    nombre_cientifico: 'Petunia hybrida',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Planta de temporada con flores en prácticamente todos los colores. Necesita sol pleno, riego regular y poda de flores marchitas para prolongar la floración. Es susceptible a las lluvias intensas y al exceso de agua en el sustrato.',
    sprite_key: 'petunia'
  },
  {
    nombre_planta: 'Bugambilia',
    nombre_cientifico: 'Bougainvillea glabra',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Enredadera tropical con brácteas de colores intensos: magenta, naranja, blanco. Muy resistente al calor y a la sequía una vez establecida. Florece más cuando se estresa levemente con menos agua. La poda post-floración es esencial.',
    sprite_key: 'bugambilia'
  },
  {
    nombre_planta: 'Ficus',
    nombre_cientifico: 'Ficus benjamina',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Árbol de interior elegante con hojas brillantes. Extremadamente sensible a los cambios: pierde hojas si lo mueves, si cambia la temperatura o si hay corrientes de aire. Una vez que encuentra su lugar ideal, crece establemente por años.',
    sprite_key: 'ficus'
  },
  {
    nombre_planta: 'Albahaca',              // ✅ nombre más preciso que 'Aromática'
    nombre_cientifico: 'Ocimum basilicum',
    tipo_planta: 'AROMATICA',             // ✅ sin tilde, normalizado
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 2,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'La albahaca es una hierba aromática y culinaria esencial. Necesita mucho sol, riego frecuente y poda de las flores para mantener el sabor de las hojas. Es muy sensible al frío. Pinzar los brotes florales retrasa la maduración y extiende la cosecha.',
    sprite_key: 'aromatica'
  },
  {
    nombre_planta: 'Rosa',
    nombre_cientifico: 'Rosa hybrida',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'La reina de las flores requiere atención constante: 6+ horas de sol, riego al suelo (no a las hojas), poda formativa en invierno y protección contra pulgones y hongos. La recompensa es una floración espectacular y duradera.',
    sprite_key: 'rosa'
  },
  {
    nombre_planta: 'Hortensia',
    nombre_cientifico: 'Hydrangea macrophylla',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Sus grandes flores esféricas cambian de color según el pH del suelo: azul en suelos ácidos, rosa en alcalinos. Necesita mucha agua y nunca debe secarse. Sensible al sol directo en verano. La poda incorrecta elimina los futuros brotes florales.',
    sprite_key: 'hortensia'
  },
  {
    nombre_planta: 'Gardenia',
    nombre_cientifico: 'Gardenia jasminoides',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 4,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Una de las flores más fragantes del mundo. Extremadamente exigente: necesita alta humedad, temperatura constante (15-24°C), agua sin cal y luz indirecta brillante. Los capullos caen si el ambiente cambia. Gratificante cuando florece.',
    sprite_key: 'gardenia'
  },
  {
    nombre_planta: 'Jazmín',
    nombre_cientifico: 'Jasminum officinale',
    tipo_planta: 'AROMATICA',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Enredadera trepadora con flores blancas de fragancia intensa, usada en perfumería. Necesita soporte para trepar, sol directo y poda post-floración para estimular nuevos brotes. Sensible al frío. Su aroma es máximo en las noches de verano.',
    sprite_key: 'jazmin'
  },
  {
    nombre_planta: 'Limonero',
    nombre_cientifico: 'Citrus limon',
    tipo_planta: 'FRUTAL',            // ✅ categoría correcta del diccionario
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Árbol frutal cítrico cultivable en maceta. Necesita mínimo 8 horas de sol, riego regular y abono específico para cítricos. La poda formativa controla su tamaño y estimula la producción de frutos. Florece con aroma intenso antes de fructificar.',
    sprite_key: 'limonero'
  },
]

module.exports = PLANT_CATALOG
