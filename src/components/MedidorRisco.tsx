import type { NivelRisco } from "../engine/types";

interface Props {
  nivel: NivelRisco;
}

const CX = 110;
const CY = 105;
const R_OUT = 92;
const R_IN = 64;

function pontoNoArco(raio: number, anguloGraus: number) {
  const rad = (Math.PI * anguloGraus) / 180;
  return { x: CX + raio * Math.cos(rad), y: CY - raio * Math.sin(rad) };
}

/** Anel de setor entre dois ângulos (em graus, 0 = direita, 180 = esquerda). */
function fatiaAnel(anguloInicial: number, anguloFinal: number) {
  const pExtIni = pontoNoArco(R_OUT, anguloInicial);
  const pExtFim = pontoNoArco(R_OUT, anguloFinal);
  const pIntFim = pontoNoArco(R_IN, anguloFinal);
  const pIntIni = pontoNoArco(R_IN, anguloInicial);
  return [
    `M ${pExtIni.x} ${pExtIni.y}`,
    `A ${R_OUT} ${R_OUT} 0 0 0 ${pExtFim.x} ${pExtFim.y}`,
    `L ${pIntFim.x} ${pIntFim.y}`,
    `A ${R_IN} ${R_IN} 0 0 1 ${pIntIni.x} ${pIntIni.y}`,
    "Z",
  ].join(" ");
}

const ZONAS: { de: number; ate: number; cor: string }[] = [
  { de: 180, ate: 120, cor: "var(--color-risco-baixo-500)" },
  { de: 120, ate: 60, cor: "var(--color-risco-moderado-500)" },
  { de: 60, ate: 0, cor: "var(--color-risco-alto-500)" },
];

const ANGULO_POR_NIVEL: Record<NivelRisco, number | null> = {
  baixo: 150,
  moderado: 90,
  alto: 30,
  indeterminado: null,
};

const COR_POR_NIVEL: Record<NivelRisco, string> = {
  baixo: "var(--color-risco-baixo-600)",
  moderado: "var(--color-risco-moderado-600)",
  alto: "var(--color-risco-alto-600)",
  indeterminado: "var(--color-indeterminado-600)",
};

export function MedidorRisco({ nivel }: Props) {
  const angulo = ANGULO_POR_NIVEL[nivel];
  const corAgulha = COR_POR_NIVEL[nivel];
  const ponta = angulo != null ? pontoNoArco(R_IN - 6, angulo) : null;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130" role="img" aria-label={`Nível de risco: ${nivel}`}>
        {ZONAS.map((z) => (
          <path key={z.de} d={fatiaAnel(z.de, z.ate)} fill={z.cor} opacity={0.9} />
        ))}
        {ponta && (
          <>
            <line x1={CX} y1={CY} x2={ponta.x} y2={ponta.y} stroke={corAgulha} strokeWidth={3.5} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={7} fill={corAgulha} />
          </>
        )}
        {angulo == null && (
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            fontSize="22"
            fontWeight={600}
            fill={corAgulha}
            fontFamily="var(--font-sans)"
          >
            ?
          </text>
        )}
      </svg>
      <div className="flex justify-between w-[210px] -mt-1 text-xs text-indeterminado-600 px-1">
        <span>Baixo</span>
        <span>Moderado</span>
        <span>Alto</span>
      </div>
    </div>
  );
}
