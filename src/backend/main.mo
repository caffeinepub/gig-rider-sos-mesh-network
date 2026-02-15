import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type EmergencyContact = {
    id : Nat;
    name : Text;
    relationship : Text;
    contactInfo : Text;
  };

  public type Breadcrumb = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  };

  public type Hazard = {
    id : Nat;
    hazardType : Text;
    severity : Text;
    description : Text;
    location : {
      latitude : Float;
      longitude : Float;
      timestamp : Time.Time;
    };
    timestamp : Time.Time;
  };

  public type SOSStatus = {
    #queued;
    #sent;
    #active;
    #ended;
  };

  public type SOSEvent = {
    id : Nat;
    userId : Principal;
    status : SOSStatus;
    note : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
    breadcrumbs : List.List<Breadcrumb>;
  };

  public type SOSEventView = {
    id : Nat;
    userId : Principal;
    status : SOSStatus;
    note : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
    breadcrumbs : [Breadcrumb];
  };

  public type UserProfile = {
    name : Text;
    handle : ?Text;
  };

  func toSOSEventView(event : SOSEvent) : SOSEventView {
    {
      id = event.id;
      userId = event.userId;
      status = event.status;
      note = event.note;
      startTime = event.startTime;
      endTime = event.endTime;
      breadcrumbs = event.breadcrumbs.toArray();
    };
  };

  let nextIdMap = Map.empty<Text, Nat>();
  let sosEvents = Map.empty<Nat, SOSEvent>();
  let hazards = Map.empty<Nat, Hazard>();

  let userEmergencyContacts = Map.empty<Principal, List.List<EmergencyContact>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getNextId(idType : Text) : Nat {
    let nextId = switch (nextIdMap.get(idType)) {
      case (?id) { id + 1 };
      case (null) { 1 };
    };
    nextIdMap.add(idType, nextId);
    nextId;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func startSOS(note : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start SOS");
    };

    let id = getNextId("SOS");
    let event : SOSEvent = {
      id;
      userId = caller;
      status = #queued;
      note;
      startTime = Time.now();
      endTime = null;
      breadcrumbs = List.empty<Breadcrumb>();
    };

    sosEvents.add(id, event);
    id;
  };

  public shared ({ caller }) func addBreadcrumb(sosId : Nat, lat : Float, long : Float) : async () {
    let event = switch (sosEvents.get(sosId)) {
      case (?event) { event };
      case (null) { Runtime.trap("SOS event not found") };
    };

    if (caller != event.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only add breadcrumbs to your own SOS events");
    };

    let newBreadcrumb : Breadcrumb = {
      latitude = lat;
      longitude = long;
      timestamp = Time.now();
    };

    let newBreadcrumbs = event.breadcrumbs;
    newBreadcrumbs.add(newBreadcrumb);
    sosEvents.add(sosId, { event with breadcrumbs = newBreadcrumbs });
  };

  public shared ({ caller }) func endSOS(sosId : Nat) : async () {
    let event = switch (sosEvents.get(sosId)) {
      case (?event) { event };
      case (null) { Runtime.trap("SOS event not found") };
    };

    if (caller != event.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only end your own SOS events");
    };

    let updatedEvent = {
      event with
      status = #ended;
      endTime = ?Time.now();
    };

    sosEvents.add(sosId, updatedEvent);
  };

  public query ({ caller }) func getSOSStatus(sosId : Nat) : async SOSEventView {
    switch (sosEvents.get(sosId)) {
      case (?event) { toSOSEventView(event) };
      case (null) { Runtime.trap("SOS event not found") };
    };
  };

  public query ({ caller }) func getUserSOS(user : Principal) : async [SOSEventView] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own SOS events");
    };

    sosEvents.values().toArray().filter(
      func(event) { event.userId == user }
    ).map<SOSEvent, SOSEventView>(toSOSEventView);
  };

  public query ({ caller }) func getEmergencyContacts(user : Principal) : async [EmergencyContact] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own emergency contacts");
    };

    switch (userEmergencyContacts.get(user)) {
      case (?contacts) { contacts.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func saveEmergencyContacts(contacts : [EmergencyContact]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save contacts");
    };

    userEmergencyContacts.add(
      caller,
      List.fromArray<EmergencyContact>(contacts),
    );
  };

  public shared ({ caller }) func submitHazard(hazardType : Text, severity : Text, description : Text, location : {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  }) : async Nat {
    let id = getNextId("Hazard");
    let hazard : Hazard = {
      id;
      hazardType;
      severity;
      description;
      location;
      timestamp = Time.now();
    };

    hazards.add(id, hazard);
    id;
  };

  public query ({ caller }) func getNearbyHazards(lat : Float, long : Float, radiusKm : Float) : async [Hazard] {
    hazards.values().toArray();
  };

  public query ({ caller }) func getAllHazards() : async [Hazard] {
    hazards.values().toArray();
  };

  public query ({ caller }) func getSOSByStatus(status : SOSStatus) : async [SOSEventView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all SOS events by status");
    };

    sosEvents.values().toArray().filter(
      func(event) { event.status == status }
    ).map<SOSEvent, SOSEventView>(toSOSEventView);
  };
};
