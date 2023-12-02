import { Networking } from "@flamework/networking";
import { PlayerData } from "./types/PlayerData";
import { FractalParameters } from "./types/FractalParameters";

interface ServerEvents {}

interface ServerFunctions {
	getData(): PlayerData | false;
	saveParameters(parameters: FractalParameters): boolean;
}

interface ClientEvents {
	dataUpdated(data: PlayerData): void;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
