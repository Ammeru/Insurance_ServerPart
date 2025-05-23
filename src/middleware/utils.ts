import { UserRole, ClientType } from '../database/models/Users';
import jwt from 'jsonwebtoken';
import axios from "axios";
import { ORS } from "@routingjs/ors"

import { RiskLevel } from "../database/models/Risk";
import { CargoType } from "../database/models/Cargos";
import {InsuranceTariff} from "../database/models/InsurancePolicies";

const OPEN_CAGE_API_KEY = process.env.OPEN_CAGE_API_KEY;
const ORS_API_KEY = process.env.ORS_API_KEY;

const ors = new ORS({ apiKey: ORS_API_KEY });

const generateJwt = (id: number, email: string, role: UserRole, clientType: ClientType) => {
    return jwt.sign(
        { id, email, role, clientType },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    )
}

async function getCoordinates(city: string): Promise<{ lat: number, lon: number}>{
    try {
        const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: {
                q: city,
                key: OPEN_CAGE_API_KEY,
                limit: 1,
                language: "ru",
            },
        });
        const result = response.data.results[0];
        if (!result) { return null as any; }

        return {
            lat: result.geometry.lat,
            lon: result.geometry.lng,
        };
    } catch (error) {
        console.error(`Ошибка получения координат для города ${city}`,error);
        return null as any;
    }
}

async function getRouteDistance(
    from: { lat: number, lon: number },
    to: { lat: number, lon: number }
): Promise<number> {
    try {
        const response = await ors.directions(
            [
                [from.lat, from.lon],
                [to.lat, to.lon],
            ],
            "driving-car"
        );

        const firstDirection = response.directions?.[0];
        const distance = firstDirection?.feature?.properties?.distance;

        console.log("Расстояние:", distance);

        if (typeof distance === "number") {
            return distance;
        } else {
            return null as any;
        }
    } catch (error) {
        console.error("Ошибка получения маршрута:", error);
        return null as any;
    }
}

function normalize(value: number, min: number, max: number): number {
    return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

function getCargoTypeWeight(type: CargoType): { weight: number, reason?: string } {
    switch (type) {
        case CargoType.HAZARDOUS: return { weight: 3, reason: "опасный груз" };
        case CargoType.VALUABLE: return { weight: 2.5, reason: "ценный груз" };
        case CargoType.FRAGILE: return { weight: 2, reason: "хрупкий груз" };
        case CargoType.LIQUID: return { weight: 1.5, reason: "жидкий груз" };
        case CargoType.PERISHABLE: return { weight: 1.5, reason: "скоропортящийся груз" };
        default: return { weight: 0 };
    }
}

function calculateRiskLevel(
    cargoWeight: number,
    cargoValue: number,
    cargoType: CargoType,
    distance: number,
): { riskLevel: RiskLevel, riskReason: string, riskScore: number } {
    const reasons: string[] = [];

    // Нормализация
    const distanceScore = normalize(distance, 0, 5000000) * 3;
    if (distanceScore > 1.5) reasons.push("большое расстояние");

    const weightScore = normalize(cargoWeight, 0, 20000) * 2;
    if (weightScore > 1) reasons.push("большой вес");

    const valueScore = Math.min(Math.log10(cargoValue + 1) / Math.log10(50000), 1) * 2;
    if (valueScore > 1) reasons.push("высокая стоимость");

    const { weight: typeScore, reason: typeReason } = getCargoTypeWeight(cargoType);
    if (typeReason) reasons.push(typeReason);

    // Кросс-факторы
    let crossScore = 0;
    if (cargoType === CargoType.HAZARDOUS && cargoValue > 50000) {
        crossScore += 1;
        reasons.push("опасный и дорогой груз");
    }
    if (cargoType === CargoType.FRAGILE && cargoWeight > 8000) {
        crossScore += 0.5;
        reasons.push("хрупкий и тяжёлый груз");
    }

    if (distance < 100000 && cargoWeight < 2000 && cargoValue < 10000) {
        crossScore -= 1;
        reasons.push("короткая дистанция и низкая стоимость/вес");
    }

    if (
        (cargoType === CargoType.GENERAL || cargoType === CargoType.PERISHABLE) &&
        distance < 300000 &&
        cargoValue < 20000
    ) {
        crossScore -= 1;
        reasons.push("низкорисковый груз и средняя дистанция");
    }

    if (cargoType === CargoType.GENERAL && cargoWeight < 3000) {
        crossScore -= 1;
        reasons.push("простой груз с небольшим весом");
    }

    crossScore = Math.max(0, crossScore);

    // Общий балл
    const totalScore = distanceScore + weightScore + valueScore + typeScore + crossScore;

    // Уровень риска
    let riskLevel: RiskLevel;
    if (totalScore >= 7.5) {
        riskLevel = RiskLevel.HIGH;
    } else if (totalScore >= 3.5) {
        riskLevel = RiskLevel.MEDIUM;
    } else {
        riskLevel = RiskLevel.LOW;
    }

    const riskReason = reasons.join(", ");
    const riskScore = Number(totalScore.toFixed(2));

    return { riskLevel, riskReason, riskScore };
}

const tariffMultipliers: Record<InsuranceTariff, number> = {
    [InsuranceTariff.FULL]: 1.2, // полное покрытие
    [InsuranceTariff.MID]: 1.0,  // стандартное покрытие
    [InsuranceTariff.LOW]: 0.7,  // частичное покрытие
};

function calculateInsuranceCost(
    cargoValue: number,
    riskScore: number,
    tariff: InsuranceTariff
): number {
    const baseRate = 0.015; // 1.5% от стоимости
    const multiplier = tariffMultipliers[tariff] || 1.0;

    const riskFactor = 1 + (riskScore / 100); // от 1.0 до 2.0
    const rawCost = cargoValue * baseRate * riskFactor * multiplier;

    return Math.round(rawCost * 100) / 100; // округляем до 2 знаков
}

export { generateJwt, getCoordinates, getRouteDistance, calculateRiskLevel, calculateInsuranceCost };