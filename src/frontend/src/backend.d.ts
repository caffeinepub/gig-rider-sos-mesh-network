import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface SOSEventView {
    id: bigint;
    startTime: Time;
    status: SOSStatus;
    endTime?: Time;
    userId: Principal;
    note: string;
    breadcrumbs: Array<Breadcrumb>;
}
export interface Breadcrumb {
    latitude: number;
    longitude: number;
    timestamp: Time;
}
export interface EmergencyContact {
    id: bigint;
    contactInfo: string;
    relationship: string;
    name: string;
}
export interface Hazard {
    id: bigint;
    description: string;
    hazardType: string;
    timestamp: Time;
    severity: string;
    location: {
        latitude: number;
        longitude: number;
        timestamp: Time;
    };
}
export interface UserProfile {
    name: string;
    handle?: string;
}
export enum SOSStatus {
    active = "active",
    sent = "sent",
    ended = "ended",
    queued = "queued"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBreadcrumb(sosId: bigint, lat: number, long: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    endSOS(sosId: bigint): Promise<void>;
    getAllHazards(): Promise<Array<Hazard>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmergencyContacts(user: Principal): Promise<Array<EmergencyContact>>;
    getNearbyHazards(lat: number, long: number, radiusKm: number): Promise<Array<Hazard>>;
    getSOSByStatus(status: SOSStatus): Promise<Array<SOSEventView>>;
    getSOSStatus(sosId: bigint): Promise<SOSEventView>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSOS(user: Principal): Promise<Array<SOSEventView>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEmergencyContacts(contacts: Array<EmergencyContact>): Promise<void>;
    startSOS(note: string): Promise<bigint>;
    submitHazard(hazardType: string, severity: string, description: string, location: {
        latitude: number;
        longitude: number;
        timestamp: Time;
    }): Promise<bigint>;
}
