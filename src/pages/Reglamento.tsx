import PageHeader from '../components/common/PageHeader';
import { FileText, Shield, Calendar, Trophy, Users, Award } from 'lucide-react';

const Reglamento = () => {
  return (
    <div>
      <PageHeader
        title="Reglamento Oficial"
        subtitle="Reglamento del Torneo Liga Master Virtual Zone Edición 2025-26"
        image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwcmVnbGFtZW50JTIwZGFya3xlbnwwfHx8fDE3NDcwNzExODB8MA&ixlib=rb-4.1.0"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Información general */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Trophy size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Reglamento Oficial del Torneo Liga Master Virtual Zone</h2>
                <p className="text-gray-300 text-sm">
                  Edición 2025-26
                </p>
                <p className="text-gray-300 mt-2">
                  Documento oficial que rige todas las competiciones organizadas por La Virtual Zone.
                </p>
              </div>
            </div>
          </div>

          {/* Contenido del reglamento */}
          <div className="bg-dark-light rounded-lg border border-gray-800 p-8">
            <div className="prose prose-invert max-w-none">

              {/* Disposiciones Preliminares y Generales */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-primary">Disposiciones Preliminares y Generales</h1>

                <h2 className="text-xl font-bold mt-8 mb-4 text-primary">Interpretación del Reglamento:</h2>
                <p className="text-gray-300 mb-4">
                  Los capítulos del reglamento constituyen una mera distribución ordenada de las materias y no deberán afectar las interpretaciones de los respectivos artículos.
                </p>
                <p className="text-gray-300 mb-4">
                  En caso de duda en la interpretación del reglamento en otros idiomas, prevalece la redacción del texto original en español, de acuerdo con el artículo 2° Inciso 2° de los Estatutos de la Virtual Zone.
                </p>

                <h2 className="text-xl font-bold mt-8 mb-4 text-primary">Fechas Clave:</h2>
                <div className="bg-dark rounded-lg p-4 mb-4">
                  <table className="w-full text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Ítem</th>
                        <th className="text-left py-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Sorteo Oficial</td>
                        <td className="py-2">06/09/25</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">Arranque del torneo</td>
                        <td className="py-2">17/11/25</td>
                      </tr>
                      <tr>
                        <td className="py-2">Finalización del torneo</td>
                        <td className="py-2">27/06/26</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-300 text-sm italic">
                  Nota: La Administración del Torneo se reserva el derecho de modificar estas fechas en caso de fuerza mayor. Cualquier cambio será comunicado a los participantes con la debida antelación.
                </p>
              </div>

              {/* Capítulo I */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo I: Disposiciones preliminares</h1>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 1º: Organizador y Participantes</h2>
                <p className="text-gray-300 mb-4">
                  La Virtual Zone organiza el Torneo Liga Master Virtual Zone Edición 2025-26.
                </p>
                <p className="text-gray-300 mb-4">
                  El torneo contará con 48 equipos, distribuidos en 4 ligas de 12 equipos cada una.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 2º: Responsabilidades y Aplicación del Reglamento</h2>
                <p className="text-gray-300 mb-4">
                  El reglamento, las directrices, y las circulares que la Administración del Torneo emita, junto con los anexos, son los únicos documentos oficiales que rigen la competencia.
                </p>
                <p className="text-gray-300 mb-4">
                  Los participantes se comprometen a cumplir con todas las normas aquí estipuladas.
                </p>
                <p className="text-gray-300 mb-4">
                  El desconocimiento del reglamento no exime de su cumplimiento.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 3º: Documentos y Anexos</h2>
                <p className="text-gray-300 mb-4">
                  Los siguientes documentos se consideran como anexos del presente reglamento y se aplican de manera complementaria a los respectivos artículos:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>Anexo A – Formulario de inscripción</li>
                  <li>Anexo B – Código de Conducta</li>
                  <li>Anexo C – Formulario de reporte de partido</li>
                  <li>Anexo D – Plantilla del calendario</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 4º: Principios de la Competencia</h2>
                <p className="text-gray-300 mb-4">
                  Este reglamento ha sido elaborado por La Virtual Zone con el objetivo de garantizar que en esta competencia se respeten estrictamente los principios de integridad, continuidad y estabilidad.
                </p>
                <p className="text-gray-300 mb-4">
                  La aplicación del Fair Play (juego limpio), la imparcialidad y la búsqueda de la verdad deportiva son fundamentales para asegurar la credibilidad de los resultados y la igualdad de oportunidades.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 5º: Colaboración y Control</h2>
                <p className="text-gray-300 mb-4">
                  La Administración del Torneo de la Virtual Zone tiene la facultad de ejercer el control y la organización de los partidos.
                </p>
                <p className="text-gray-300 mb-4">
                  Puede emitir directrices, instrucciones, circulares y sanciones para la correcta dirección y finalización del torneo.
                </p>
                <p className="text-gray-300 mb-4">
                  Sus decisiones son finales e inapelables.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 6º: Representantes de los Participantes</h2>
                <p className="text-gray-300 mb-4">
                  Cada participante es considerado un delegado de su equipo.
                </p>
                <p className="text-gray-300 mb-4">
                  Es responsable de estar al tanto de las comunicaciones oficiales y de asegurarse de que se cumplan las normativas del reglamento.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 7º: Comunicación Oficial</h2>
                <p className="text-gray-300 mb-4">
                  Las comunicaciones oficiales de la Administración del Torneo se realizarán a través de los canales designados (ej. grupos de WhatsApp o Discord).
                </p>
                <p className="text-gray-300 mb-4">
                  Los participantes deben mantener contacto regular para estar informados sobre cualquier cambio o anuncio.
                </p>
              </div>

              {/* Capítulo II */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo II: La competición: denominación y participación</h1>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 8º: Requisitos de Participación</h2>
                <p className="text-gray-300 mb-4">
                  Los participantes del Torneo Liga Master Virtual Zone Edición 2025-26 deben cumplir con los siguientes requisitos para ser inscritos en la competición:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>Haberse completado y enviado el formulario de inscripción oficial.</li>
                  <li>Cumplir con todas las normativas establecidas en este reglamento.</li>
                  <li>Haberse verificado su disponibilidad de tiempo para jugar los partidos.</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 9º: Nomenclatura del Torneo y Participantes</h2>
                <p className="text-gray-300 mb-4">
                  El torneo se denomina oficialmente Torneo Liga Master Virtual Zone.
                </p>
                <p className="text-gray-300 mb-4">
                  La participación está abierta a 48 equipos, distribuidos en 4 ligas de 12 equipos cada una.
                </p>
                <p className="text-gray-300 mb-4">
                  Los participantes han sido seleccionados por la administración del torneo.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 10º: Plazos de Participación</h2>
                <p className="text-gray-300 mb-4">
                  El torneo se desarrollará de acuerdo con las fechas establecidas en el Artículo 2º del presente reglamento.
                </p>
                <p className="text-gray-300 mb-4">
                  La participación es voluntaria y los participantes son responsables de estar informados sobre los plazos y horarios de la competición.
                </p>
              </div>

              {/* Capítulo III */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo III: Formato de la competición y sorteo oficial</h1>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 11º: Formato de la Competencia</h2>
                <p className="text-gray-300 mb-4">
                  El torneo se dividirá en dos etapas principales: la Fase de Ligas y la Copa.
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Fase de Ligas:</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>48 equipos distribuidos en 4 ligas de 12 equipos cada una.</li>
                  <li>La fase se jugará en un formato de todos contra todos a doble vuelta, sumando 22 partidos por equipo.</li>
                  <li>Se disputará un partido "clásico" adicional, que sumará puntos para la clasificación de la liga, además que se tendrá en cuenta para las estadísticas del torneo.</li>
                  <li>El calendario de partidos será determinado por la Administración del Torneo.</li>
                </ul>

                <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Copa:</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>Es un formato de eliminación directa, donde se enfrentan los 48 equipos desde la primera ronda.</li>
                  <li>Todos los partidos de la Copa se jugarán a un partido único.</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 12º: Sorteo Oficial</h2>
                <p className="text-gray-300 mb-4">
                  El sorteo oficial se llevará a cabo en la fecha establecida en el Artículo 2º.
                </p>
                <p className="text-gray-300 mb-4">
                  Este sorteo determinará los grupos de la Fase de Ligas y los emparejamientos de la primera ronda de la Copa.
                </p>
                <p className="text-gray-300 mb-4">
                  El sorteo será público y transmitido por los canales oficiales de la Virtual Zone.
                </p>
                <p className="text-gray-300 mb-4">
                  La Administración del Torneo se reserva el derecho de ajustar los emparejamientos en caso de errores en el sorteo.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 13º: Fases y Emparejamientos</h2>

                <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Fase de Ligas:</h3>
                <p className="text-gray-300 mb-4">
                  El torneo se disputará en un formato de todos contra todos a doble vuelta, donde cada equipo enfrentará a los otros 11 equipos de su misma liga dos veces.
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Copa:</h3>
                <p className="text-gray-300 mb-4">
                  Los 48 equipos participarán en un formato de eliminación directa a partido único desde la primera ronda. Los emparejamientos se determinarán por sorteo puro.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 14º: Procedimientos de Sorteo</h2>
                <p className="text-gray-300 mb-4">
                  El sorteo oficial se llevará a cabo en la fecha establecida en el Artículo 2º.
                </p>
                <p className="text-gray-300 mb-4">
                  Los 48 equipos participantes serán distribuidos en 6 bombos de 8 equipos cada uno, según el ranking de la Virtual Zone (VZR) del 2024. Este ranking se basa en los puntos obtenidos en los torneos previos de la Liga Master.
                </p>
                <p className="text-gray-300 mb-4">
                  La distribución de los bombos será la siguiente:
                </p>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>Bombo 1: Equipos clasificados en los puestos 1 al 8 del ranking VZR.</li>
                  <li>Bombo 2: Equipos clasificados en los puestos 9 al 16 del ranking VZR.</li>
                  <li>Bombo 3: Equipos clasificados en los puestos 17 al 24 del ranking VZR.</li>
                  <li>Bombo 4: Equipos clasificados en los puestos 25 al 32 del ranking VZR.</li>
                  <li>Bombo 5: Equipos clasificados en los puestos 33 al 40 del ranking VZR.</li>
                  <li>Bombo 6: Equipos clasificados en los puestos 41 al 48 del ranking VZR.</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  El sorteo para la Fase de Ligas se realizará extrayendo 2 equipos de cada bombo para cada una de las 4 ligas (A, B, C y D). Esto garantizará que cada liga tenga una distribución equitativa de equipos de todos los niveles del ranking.
                </p>
                <p className="text-gray-300 mb-4">
                  El sorteo será transmitido en vivo y los resultados se publicarán en los canales oficiales de la Virtual Zone. La Administración del Torneo se reserva el derecho de ajustar los emparejamientos en caso de errores en el sorteo.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 15º: Sorteo de la Copa</h2>
                <p className="text-gray-300 mb-4">
                  La primera ronda de la Copa se sorteará de forma pura entre los 48 equipos participantes, sin distinción de ligas o ranking. Los emparejamientos se jugarán a partido único.
                </p>
              </div>

              {/* Continuar con el resto del reglamento - Capítulo IV y siguientes */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo IV: Puntaje y Criterios de Desempate</h1>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 17º: Sistema de Puntuación</h2>
                <p className="text-gray-300 mb-4">
                  Durante la fase de ligas, los equipos serán clasificados en la tabla de posiciones de acuerdo con los siguientes criterios, en orden de prioridad:
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Puntos:</h3>
                <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                  <li>Victoria: 3 puntos</li>
                  <li>Empate: 1 punto</li>
                  <li>Derrota: 0 puntos</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 18º: Criterios de Desempate en la Liga</h2>
                <p className="text-gray-300 mb-4">
                  En caso de que dos o más equipos finalicen la fase de ligas con el mismo puntaje, los criterios para determinar su posición serán los siguientes, en estricto orden de prioridad:
                </p>
                <ol className="list-decimal list-inside text-gray-300 mb-4 ml-6">
                  <li>Mayor diferencia de goles en todos los partidos de la liga.</li>
                  <li>Mayor número de goles a favor en todos los partidos de la liga.</li>
                  <li>Resultado del partido entre los equipos empatados (enfrentamiento directo). El equipo que haya ganado el enfrentamiento directo quedará por encima.</li>
                  <li>Menor número de tarjetas rojas acumuladas durante la fase de ligas.</li>
                  <li>Menor número de tarjetas amarillas acumuladas durante la fase de ligas.</li>
                  <li>Sorteo realizado por la Administración del Torneo.</li>
                </ol>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 19º: Desempate por el Primer Puesto de la Liga</h2>
                <p className="text-gray-300 mb-4">
                  En caso de que dos o más equipos terminen con los mismos puntos y estén disputando el primer lugar de la liga, se jugará un partido de desempate en un host neutral.
                </p>
                <p className="text-gray-300 mb-4">
                  En este partido no se considerarán los criterios de diferencia de goles o goles a favor.
                </p>
                <p className="text-gray-300 mb-4">
                  El partido tendrá tiempo extra y tanda de penales si el empate persiste.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 20º: Desempate en la Copa</h2>
                <p className="text-gray-300 mb-4">
                  Si un partido de la Copa (fase de eliminación directa) termina empatado al final del tiempo reglamentario, se jugará una prórroga de 30 minutos (dos partes de 15 minutos cada una).
                </p>
                <p className="text-gray-300 mb-4">
                  Si el marcador persiste en empate, el ganador se definirá mediante una tanda de penales, de acuerdo con las reglas de la IFAB.
                </p>
              </div>

              {/* Continuar con más capítulos - resumiendo por brevedad */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo V: Preparación de la Competición</h1>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 21º: Calendario y Horarios de los Partidos</h2>
                <p className="text-gray-300 mb-4">
                  La Administración del Torneo será responsable de establecer las fechas de las jornadas, los plazos para la disputa de los partidos y de comunicar esta información a los participantes.
                </p>
                <p className="text-gray-300 mb-4">
                  El calendario oficial será publicado a través de los canales de comunicación designados.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 22º: Programación de los Encuentros</h2>
                <p className="text-gray-300 mb-4">
                  Cada participante deberá jugar un partido por semana.
                </p>
                <p className="text-gray-300 mb-4">
                  Los partidos de la Fase de Ligas deberán disputarse de lunes a viernes, entre las 20:00 y las 23:00 horas, horario de Argentina.
                </p>
                <p className="text-gray-300 mb-4">
                  Es responsabilidad de los participantes coordinar y acordar la fecha y hora exacta del partido dentro del plazo establecido para cada jornada.
                </p>
                <p className="text-gray-300 mb-4">
                  La comunicación de este acuerdo deberá realizarse a través de los canales oficiales.
                </p>
                <p className="text-gray-300 mb-4">
                  Si un partido no se disputa dentro del plazo establecido debido a la falta de acuerdo entre los participantes, la Administración del Torneo podrá intervenir, asignar una fecha y hora, o tomar la decisión que considere necesaria para garantizar la continuidad del torneo.
                </p>

                {/* Continuar con más artículos... */}
              </div>

              {/* Capítulos completos */}
              <div className="space-y-12">
                {/* Capítulo VI */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo VI: Estadios y Condiciones de Partido</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 26º: Estadios de los Encuentros</h2>
                  <p className="text-gray-300 mb-4">
                    Cada participante deberá seleccionar un estadio para disputar todos sus partidos de local a lo largo de la competencia.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Esta elección será inmodificable durante el transcurso del torneo.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de modificar esta elección solo en casos de fuerza mayor, previa comunicación y acuerdo con el participante.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 27º: Condiciones del Terreno de Juego</h2>
                  <p className="text-gray-300 mb-4">
                    El equipo local, antes del inicio de cada partido, tiene la potestad de elegir las siguientes condiciones del terreno de juego:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Altura del césped: normal, corto o largo.</li>
                    <li>Estado del terreno: seco, normal o húmedo.</li>
                  </ul>
                  <p className="text-gray-300 mb-4">
                    Una vez que el partido haya iniciado, no se podrán realizar cambios en estas condiciones.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 28º: Condiciones Climáticas</h2>
                  <p className="text-gray-300 mb-4">
                    Las condiciones climáticas de los partidos estarán predeterminadas de la siguiente manera:
                  </p>
                  <p className="text-gray-300 mb-4">
                    Por defecto, todos los partidos se jugarán en un clima de Verano con una condición de Despejado y en horario Nocturno.
                  </p>
                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Excepciones:</h3>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Lluvia:</strong> Las jornadas 4, 8, 12, 16 y 20 se jugarán bajo una condición climática de lluvia.</li>
                    <li><strong>Nieve (Evento de Navidad):</strong> Las jornadas 3 y 4 se jugarán bajo una condición climática de nieve, como evento especial de la competencia.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 29º: Uniformes y Equipamiento de los Clubes</h2>
                  <p className="text-gray-300 mb-4">
                    Cada club participante deberá proporcionar tres kits de camisetas para su equipo:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Kit 1:</strong> La camiseta titular del club.</li>
                    <li><strong>Kit 2:</strong> La camiseta suplente del club.</li>
                    <li><strong>Kit 3:</strong> Una camiseta alternativa con un color y diseño que se diferencie claramente de los dos kits anteriores.</li>
                  </ul>
                  <p className="text-gray-300 mb-4">
                    El equipo visitante tendrá la responsabilidad de elegir un kit que ofrezca el mayor contraste con el uniforme titular del equipo local para evitar cualquier tipo de confusión visual en el campo de juego.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de intervenir y solicitar a un equipo que cambie de uniforme si considera que los colores son demasiado similares a los de su oponente, comprometiendo la claridad del partido.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cualquier intento de modificar los uniformes o la apariencia de los jugadores con el fin de obtener una ventaja injusta o confundir al oponente será motivo de sanción.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 30º: Cámara del Partido</h2>
                  <p className="text-gray-300 mb-4">
                    Los partidos deberán contar con la cámara amplia dinámica 0,10,0.
                  </p>
                </div>

                {/* Capítulo VIII */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo VIII: Sanciones y Exclusiones</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 31º: Deberes del Participante</h2>
                  <p className="text-gray-300 mb-4">
                    Todo participante, una vez aceptado en el torneo, se compromete a cumplir con las normas del presente reglamento y a disputar todos los partidos de su equipo de acuerdo con el calendario y los horarios establecidos.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 32º: Causales de Sanción y Expulsión</h2>
                  <p className="text-gray-300 mb-4">
                    El incumplimiento de las obligaciones del participante o el no acatamiento de las disposiciones del presente reglamento serán objeto de sanción por parte de la Administración del Torneo.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Las siguientes acciones o inacciones pueden derivar en sanciones, incluyendo la expulsión del torneo:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Ausencia o incomparecencia (WO):</strong> Si un participante no se presenta a un partido en la fecha y hora acordadas, y sin causa justificada, se le considerará ausente. La reincidencia en la incomparecencia podrá resultar en sanciones más severas.</li>
                    <li><strong>Incumplimiento de las reglas:</strong> La violación de cualquier artículo del presente reglamento, como el uso de configuraciones de juego no permitidas, la manipulación de resultados o cualquier otra forma de conducta antideportiva.</li>
                    <li><strong>Comportamiento antideportivo:</strong> Insultos, lenguaje ofensivo, amenazas o cualquier otra conducta que altere el orden y el respeto entre los participantes.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 33º: Procedimiento de Expulsión</h2>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo tiene la facultad de analizar y decidir sobre la expulsión de un participante que, de manera reiterada o en un acto de extrema gravedad, incumpla con sus obligaciones.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La decisión de expulsión será comunicada por escrito al participante y será inapelable.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 34º: Procedimiento en caso de expulsión</h2>
                  <p className="text-gray-300 mb-4">
                    Si un participante es expulsado del torneo, la Administración de la Virtual Zone buscará un reemplazo entre los jugadores inscritos en la lista de espera o, en su defecto, invitará a un nuevo jugador para que asuma el control del equipo vacante.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El nuevo participante jugará los partidos restantes de la liga, manteniendo los puntos y el récord del equipo hasta el momento de su incorporación.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El jugador expulsado perderá automáticamente los premios o reconocimientos a los que pudiera aspirar y quedará vetado de futuras ediciones de la Liga Master Virtual Zone.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 35º: Requisitos de Elegibilidad</h2>
                  <p className="text-gray-300 mb-4">
                    Para ser elegible para participar en el Torneo Liga Master Virtual Zone Edición 2025-26, el jugador debe estar debidamente inscrito a través de los canales y procedimientos establecidos en el presente reglamento.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de verificar la identidad de cualquier jugador para asegurar el cumplimiento del proceso de inscripción.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cualquier intento de suplantación de identidad o de inscribir a un jugador que no cumpla con los requisitos establecidos será motivo de descalificación inmediata.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 36º: Representación en la Competencia</h2>
                  <p className="text-gray-300 mb-4">
                    Cada participante es el único responsable de jugar con su equipo durante toda la competición.
                  </p>
                  <p className="text-gray-300 mb-4">
                    En caso de fuerza mayor que impida a un jugador disputar un partido, la Administración del Torneo deberá ser notificada con la mayor antelación posible. La Administración evaluará la situación y tomará una decisión, que podría incluir el aplazamiento del partido o la aplicación de la regla de incomparecencia (WO).
                  </p>
                  <p className="text-gray-300 mb-4">
                    Se prohíbe explícitamente que un jugador diferente al titular inscrito dispute un partido. La violación de esta norma resultará en la descalificación inmediata del equipo y la expulsión del jugador de la competición.
                  </p>
                </div>

                {/* Capítulo IX */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo IX: Requisitos de Comunicación</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 37º: Uso Obligatorio de Discord y Micrófono</h2>
                  <p className="text-gray-300 mb-4">
                    Es obligatorio que todos los participantes se unan al canal oficial de Discord de la Virtual Zone para disputar sus partidos.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El uso de un micrófono es mandatorio para la comunicación entre los participantes durante los partidos.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El no cumplimiento de este artículo, ya sea por la ausencia en el canal de Discord o por no contar con un micrófono funcional, impedirá al participante disputar el partido, lo que podría derivar en una sanción o la pérdida de puntos por incomparecencia (WO).
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de utilizar las conversaciones y audios de las partidas para la transmisión en vivo, los resúmenes y cualquier otro contenido relacionado con el torneo.
                  </p>
                </div>

                {/* Capítulo X */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo X: Gestión de Equipos y Mercado de Fichajes</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 38º: Integridad de las Plantillas</h2>
                  <p className="text-gray-300 mb-4">
                    Todos los equipos participantes utilizarán las <strong>plantillas por defecto</strong> del modo Liga Master de PES 2021.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Queda terminantemente prohibido modificar las estadísticas, habilidades o cualquier otro atributo de los jugadores de la plantilla original.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de auditar las plantillas de los equipos en cualquier momento para verificar el cumplimiento de este artículo.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 39º: Uso de Jugadores</h2>
                  <p className="text-gray-300 mb-4">
                    Los participantes solo pueden usar a los jugadores que forman parte de la plantilla inicial de su equipo seleccionado en el modo Liga Master.
                  </p>
                  <p className="text-gray-300 mb-4">
                    No se permite la inclusión de jugadores de otros equipos o la creación de jugadores ficticios.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cualquier violación a esta regla será considerada una manipulación de la plantilla y resultará en la descalificación inmediata del equipo.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 40º: Mercado de Fichajes</h2>
                  <p className="text-gray-300 mb-4">
                    Los equipos contarán con la posibilidad de gestionar su plantilla a través de un mercado de fichajes, donde podrán fichar, vender, entrenar, liberar e intercambiar jugadores.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El mercado de fichajes estará abierto en las siguientes ventanas, de acuerdo al calendario oficial del torneo:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Primera Ventana:</strong> Dos semanas antes del inicio del torneo.</li>
                    <li><strong>Segunda Ventana:</strong> Durante la fecha 6.</li>
                    <li><strong>Tercera Ventana:</strong> Durante la fecha 12.</li>
                    <li><strong>Cuarta Ventana:</strong> Durante la fecha 18.</li>
                  </ul>
                  <p className="text-gray-300 mb-4">
                    Solo se podrán realizar fichajes en las ventanas establecidas.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 41º: Salarios y Costos de la Plantilla</h2>
                  <p className="text-gray-300 mb-4">
                    Cada jugador que no forme parte de la nómina inicial de 23 jugadores por defecto del equipo, contará con un sueldo a cobrar.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cada equipo es responsable de gestionar sus finanzas para poder pagar los salarios de sus jugadores, evitando llegar a la bancarrota.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo llevará un registro de los salarios y el estado financiero de cada club.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 42º: Incumplimiento Financiero y Sanciones</h2>
                  <p className="text-gray-300 mb-4">
                    En caso de que un equipo presente deudas, deberá saldar esa deuda obligatoriamente, ya sea vendiendo o liberando jugadores.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Si un equipo llega a tener menos de 16 jugadores en su plantilla como resultado de tener que saldar una deuda (cantidad mínima que permite el juego), se declarará en bancarrota.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La sanción por bancarrota será la <strong>refundación del club</strong>. El equipo perderá a todos sus jugadores, regresará a cero y comenzará la siguiente temporada en la división más baja.
                  </p>
                </div>

                {/* Capítulo XI */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XI: Registro de Jugadores y Datos Personales</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 43º: Requisitos de Registro</h2>
                  <p className="text-gray-300 mb-4">
                    Para la correcta inscripción de los participantes y la organización del torneo, cada jugador debe enviar la siguiente información a la Administración del Torneo a través del formulario oficial:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Nombre completo (nombre y apellido).</li>
                    <li>Fotografía de perfil reciente. Esta foto será utilizada en la página web oficial del torneo y en las transmisiones.</li>
                    <li>Nacionalidad.</li>
                    <li>Número telefónico, incluyendo el código de país. Este será el medio principal para la comunicación a través de aplicaciones como WhatsApp.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 44º: Protección de Datos y Uso de la Información</h2>
                  <p className="text-gray-300 mb-4">
                    La Virtual Zone garantiza la protección de los datos personales proporcionados por los participantes.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La información será utilizada exclusivamente con fines de organización, difusión y comunicación del torneo.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Al inscribirse, el participante acepta que su nombre, fotografía de perfil y nacionalidad sean utilizados en la página web, en las transmisiones en vivo y en otros materiales promocionales del torneo.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de verificar la exactitud de los datos proporcionados. Cualquier información falsa será motivo de descalificación del participante.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 45º: Comunicación entre Participantes</h2>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo creará un grupo de WhatsApp oficial para facilitar la comunicación entre los participantes, coordinar partidos y compartir información relevante.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La presencia en este grupo es obligatoria para todos los jugadores.
                  </p>
                </div>

                {/* Capítulo XII */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XII: Reglas de Juego y Conducta en el Campo</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 46º: Prohibición de Saltear Cinemáticas</h2>
                  <p className="text-gray-300 mb-4">
                    Los participantes tienen la obligación de permitir que se desarrollen todas las cinemáticas del juego, incluyendo la entrada de los jugadores, celebraciones de goles, y cualquier otra secuencia de video preestablecida.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Queda estrictamente prohibido saltear cualquier cinemática, ya que estas son parte integral de la experiencia del torneo.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 47º: Uso del Botón de Pausa</h2>
                  <p className="text-gray-300 mb-4">
                    El botón de pausa solo podrá ser utilizado cuando la pelota no esté en juego (ej. fuera del campo, en una falta, tiro libre, saque de esquina, etc.).
                  </p>
                  <p className="text-gray-300 mb-4">
                    El juego cuenta con un modo de competencia que indicará en la pantalla qué equipo ha pulsado el botón de pausa.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El uso indebido del botón de pausa durante el juego en curso, con la intención de detener una jugada del rival o de ganar tiempo de forma antideportiva, será motivo de sanción inmediata.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 48º: Comportamiento en el Campo</h2>
                  <p className="text-gray-300 mb-4">
                    Se espera que los participantes actúen con la máxima deportividad y respeto, tanto en sus acciones como en sus palabras, dentro del servidor de Discord.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo se reserva el derecho de sancionar a cualquier jugador que realice acciones antideportivas en el campo, como la celebración excesiva o cualquier otra acción que se considere una falta de respeto al oponente.
                  </p>
                </div>

                {/* Capítulo XIII */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XIII: Cuestiones Disciplinarias</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 49º: Disposiciones Generales</h2>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo tiene la facultad exclusiva de imponer sanciones por las infracciones al presente reglamento.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Estas sanciones se aplicarán de acuerdo con el Código de Disciplina de La Virtual Zone y serán inmutables.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 50º: Tipos de Faltas</h2>
                  <p className="text-gray-300 mb-4">
                    Se considerarán como faltas, entre otras, las siguientes:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Faltas graves:</strong> Suplantación de identidad, manipulación de resultados, uso de software de terceros para obtener ventaja, o cualquier tipo de trampa.</li>
                    <li><strong>Faltas leves:</strong> Ausencia sin justificación, uso de lenguaje ofensivo en los canales de comunicación, o incumplimiento de los horarios acordados.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 51º: Sanciones por Infracción</h2>
                  <p className="text-gray-300 mb-4">
                    Las sanciones que puede imponer la Administración del Torneo incluyen, pero no se limitan a:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Advertencia formal.</li>
                    <li>Pérdida de puntos en la tabla de posiciones.</li>
                    <li>Multa virtual (deducción del presupuesto del equipo en el modo de gestión financiera).</li>
                    <li>Suspensión de uno o más partidos.</li>
                    <li>Descalificación del torneo.</li>
                    <li>Veto de futuras ediciones.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 52º: Sanciones por Tarjetas y Lesiones</h2>
                  <p className="text-gray-300 mb-4">
                    Las tarjetas amarillas y rojas, aplicadas dentro del juego, tendrán las siguientes consecuencias disciplinarias para los jugadores:
                  </p>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Tarjeta Amarilla:</h3>
                  <p className="text-gray-300 mb-4">
                    Un jugador que acumule un total de <strong>cinco (5) tarjetas amarillas</strong> a lo largo de la fase de liga será suspendido automáticamente por el siguiente partido de su equipo. Al finalizar la fase de liga, todas las tarjetas amarillas acumuladas serán "limpiadas", a excepción de los jugadores que lleguen a las 4 tarjetas en el último partido.
                  </p>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Tarjeta Roja Directa:</h3>
                  <p className="text-gray-300 mb-4">
                    La obtención de una tarjeta roja directa resultará en la expulsión inmediata del jugador del partido en curso y una <strong>suspensión automática de 2 partidos para el siguiente encuentro</strong> de su equipo en la competencia donde recibió dicha tarjeta.
                  </p>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Expulsión por Doble Tarjeta Amarilla:</h3>
                  <p className="text-gray-300 mb-4">
                    Si un jugador es expulsado por acumular dos (2) tarjetas amarillas en un mismo partido, la sanción será la misma que la de una tarjeta roja directa: el jugador no podrá participar en el siguiente partido.
                  </p>

                  <p className="text-gray-300 mb-4">
                    Las tarjetas amarillas/rojas sancionadas en un partido de liga, no aplica efecto en el partido de copa, a excepción de la lesión del jugador.
                  </p>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Lesión de un jugador:</h3>
                  <p className="text-gray-300 mb-4">
                    Si un jugador es lesionado en el partido, el jugador no podrá participar en el siguiente partido.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 53º: Procedimiento de Sanción</h2>
                  <p className="text-gray-300 mb-4">
                    En caso de una infracción, la Administración del Torneo notificará al participante la falta cometida y la sanción correspondiente.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El participante tendrá un plazo de 24 horas para presentar sus descargos o pruebas que demuestren su inocencia.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La decisión final de la Administración del Torneo, tras analizar los descargos, será definitiva e inapelable.
                  </p>
                </div>

                {/* Capítulo XIV */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XIV: Organización de Partidos</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 54º: Programación de Encuentros</h2>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo tiene la facultad de fijar las fechas y horarios de los partidos.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La programación será publicada en los canales oficiales y es responsabilidad de los participantes estar informados de los mismos.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cada participante tiene la obligación de presentarse en el discord en el horario pactado para el partido. Se concederá una tolerancia de <strong>15 minutos</strong> desde la hora programada.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 55º: Delegados de Partido</h2>
                  <p className="text-gray-300 mb-4">
                    Cada participante es considerado el delegado de su equipo.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Es responsable de la correcta configuración del partido, el reporte de resultados (en caso de que la transmisión oficial falle) y el cumplimiento de las reglas.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 56º: Procedimiento de Partido</h2>
                  <p className="text-gray-300 mb-4">
                    El hoster será responsable de:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Crear la sala de juego.</li>
                    <li>Configurar el partido según lo estipulado en el Capítulo V del presente reglamento.</li>
                    <li>Asegurar una conexión estable para el desarrollo del encuentro.</li>
                  </ul>
                </div>

                {/* Capítulo XV */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XV: Abandono, Suspensión y Cancelación de Partidos</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 57º: Suspensión de Partidos</h2>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo puede suspender temporalmente un partido en caso de incidentes graves, como problemas de conexión masivos, un comportamiento antideportivo severo o cualquier otra causa de fuerza mayor.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El partido se reanudará en una fecha y hora por determinar.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 58º: Abandono de un Participante</h2>
                  <p className="text-gray-300 mb-4">
                    Se considera que un participante ha abandonado un partido si se desconecta de la sala de juego y <strong>no se reconecta en un plazo de 10 minutos</strong>, sin causa justificada.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Si un participante abandona un partido, la victoria se le otorgará a su oponente por un marcador de <strong>3-0</strong>.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La reincidencia en el abandono de partidos podrá ser motivo de sanciones más severas, incluyendo la expulsión del torneo.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 59º: Cancelación de un Partido (Modificación)</h2>
                  <p className="text-gray-300 mb-4">
                    Un partido podrá ser cancelado si un participante no se presenta, lo que resultará en una victoria por incomparecencia (<strong>WO</strong>) para el equipo presente.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Los puntos se otorgarán de acuerdo con las reglas de la competición, y la Administración del Torneo decidirá la sanción para el participante ausente.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El resultado oficial del WO será de <strong>3-0</strong>. El equipo ausente recibirá un registro de 3 goles en contra y 0 goles a favor.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 60º: Problemas de Conexión Recurrentes</h2>
                  <p className="text-gray-300 mb-4">
                    En caso de que un participante presente problemas de conexión persistentes que impidan el desarrollo normal de un partido, su oponente tendrá la potestad de decidir cómo proceder.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Las opciones disponibles para el oponente afectado son:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li><strong>Reclamar la victoria por incomparecencia (WO):</strong> El partido se dará por terminado y se otorgarán los puntos y el resultado (<strong>3-0</strong>) al oponente.</li>
                    <li><strong>Jugar el partido al día siguiente:</strong> El partido se pospondrá para el día siguiente, en un horario a convenir por ambos participantes y con la supervisión de la Administración del Torneo.</li>
                  </ul>
                  <p className="text-gray-300 mb-4">
                    El participante con problemas de conexión deberá acatar la decisión de su oponente.
                  </p>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-primary">Excepción por Desconexión Definitiva:</h3>
                  <p className="text-gray-300 mb-4">
                    Si el participante con problemas de conexión se desconecta y no regresa a la sala, la siguiente regla aplicará automáticamente:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Si la desconexión ocurre del <strong>minuto 75 en adelante</strong> y el marcador tiene una <strong>ventaja de tres (3) goles o más</strong> a favor del oponente, el partido se dará por finalizado con el resultado del momento para el equipo que no se desconectó.</li>
                    <li>Si la desconexión ocurre antes del minuto 75, o si ocurre del minuto 75 en adelante pero con una ventaja menor a tres (3) goles, el partido se intentará postergar para el día siguiente.</li>
                  </ul>
                  <p className="text-gray-300 mb-4">
                    Si no se logra un acuerdo, la decisión final recaerá sobre la Administración del Torneo.
                  </p>
                </div>

                {/* Capítulo XVI */}
                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XVI: Régimen de Integridad y Conducta</h1>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 61º: Principios de Integridad</h2>
                  <p className="text-gray-300 mb-4">
                    Todos los participantes del torneo se comprometen a respetar los principios de integridad, honestidad y Fair Play.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Se prohíbe cualquier tipo de conducta que intente alterar la verdad deportiva de los resultados.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 62º: Prohibición de Manipulación de Partidos</h2>
                  <p className="text-gray-300 mb-4">
                    La manipulación de resultados, ya sea a través de acuerdos, la simulación de faltas o cualquier otra práctica engañosa, está estrictamente prohibida.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Cualquier intento de esta índole será investigado por la Administración del Torneo y resultará en la descalificación inmediata de los participantes involucrados.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 63º: Sanciones por Comportamiento Antideportivo</h2>
                  <p className="text-gray-300 mb-4">
                    Se considera comportamiento antideportivo, entre otros, los siguientes actos:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mb-4 ml-6">
                    <li>Uso de lenguaje ofensivo, insultos, o amenazas.</li>
                    <li>Actos de provocación, burla o falta de respeto hacia el oponente.</li>
                    <li>Desconexión intencional de un partido para evitar una derrota.</li>
                    <li>Cualquier otra acción que la Administración del Torneo considere contraria a los principios del juego limpio.</li>
                  </ul>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 64º: Código de Conducta</h2>
                  <p className="text-gray-300 mb-4">
                    Todos los participantes están obligados a cumplir con el Código de Conducta de la Virtual Zone, que se anexa al presente reglamento.
                  </p>
                  <p className="text-gray-300 mb-4">
                    El incumplimiento de dicho código resultará en sanciones disciplinarias.
                  </p>
                </div>

                <div>
                  <h1 className="text-2xl font-bold mb-6 text-primary">Capítulo XVII: Premios y Disposiciones Finales</h1>
                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 65º: Premios</h2>
                  <p className="text-gray-300 mb-4">
                    Los premios se otorgarán al campeón, subcampeón y tercer lugar de la Copa, así como al máximo goleador y al mejor defensor.
                  </p>

                  <h2 className="text-xl font-bold mt-6 mb-4 text-primary">Artículo 66º: Casos No Previstos</h2>
                  <p className="text-gray-300 mb-4">
                    Cualquier situación no contemplada en este reglamento será resuelta por la Administración del Torneo, cuya decisión es final.
                  </p>
                  <p className="text-gray-300 mb-4">
                    La Administración del Torneo, como máximo órgano regulador de la competencia, posee la jurisdicción exclusiva para interpretar, aplicar y hacer cumplir el presente reglamento. Sus decisiones sobre cualquier asunto, incluyendo, pero no limitado a, sanciones, resultados de partidos, y casos no previstos, son finales, vinculantes y no podrán ser objeto de apelación ante ninguna otra instancia.
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-8 mt-8">
                  <h1 className="text-xl font-bold text-center text-primary">DISPOSICIÓN FINAL</h1>
                  <p className="text-gray-300 text-center mt-4">
                    Este reglamento entra en vigencia a partir del <strong>17 de noviembre de 2025</strong>.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield size={24} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-500 mb-2">Información Importante</h3>
                <p className="text-gray-300 text-sm">
                  Este reglamento es vinculante para todos los participantes. La Administración del Torneo se reserva el derecho
                  de interpretar y aplicar estas normas. Cualquier duda debe ser consultada a través de los canales oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reglamento;
