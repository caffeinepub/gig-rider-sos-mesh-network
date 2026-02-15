import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { EmergencyContact } from '../../backend';

interface ContactsState {
  localContacts: EmergencyContact[];
  setLocalContacts: (contacts: EmergencyContact[]) => void;
  nextLocalId: number;
  getNextId: () => bigint;
}

const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      localContacts: [],
      nextLocalId: 1,
      setLocalContacts: (contacts) => set({ localContacts: contacts }),
      getNextId: () => {
        const id = get().nextLocalId;
        set({ nextLocalId: id + 1 });
        return BigInt(id);
      },
    }),
    {
      name: 'emergency-contacts',
    }
  )
);

export function useEmergencyContacts() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { localContacts, setLocalContacts, getNextId } = useContactsStore();

  const isAuthenticated = !!identity;

  const { data: backendContacts, isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['emergencyContacts', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getEmergencyContacts(identity.getPrincipal());
    },
    enabled: !!actor && isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: async (contacts: EmergencyContact[]) => {
      if (!actor || !identity) throw new Error('Not authenticated');
      return actor.saveEmergencyContacts(contacts);
    },
    onSuccess: (_, newContacts) => {
      queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], newContacts);
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const contacts = isAuthenticated ? (backendContacts || []) : localContacts;

  const addContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: getNextId(),
    };

    if (isAuthenticated && actor) {
      const updatedContacts = [...contacts, newContact];
      queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], updatedContacts);
      
      try {
        await saveMutation.mutateAsync(updatedContacts);
      } catch (error) {
        queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], contacts);
        throw error;
      }
    } else {
      setLocalContacts([...localContacts, newContact]);
    }
  };

  const updateContact = async (contact: EmergencyContact) => {
    const updated = contacts.map((c) => (c.id === contact.id ? contact : c));

    if (isAuthenticated && actor) {
      const previousContacts = contacts;
      queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], updated);
      
      try {
        await saveMutation.mutateAsync(updated);
      } catch (error) {
        queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], previousContacts);
        throw error;
      }
    } else {
      setLocalContacts(updated);
    }
  };

  const removeContact = async (id: bigint) => {
    const filtered = contacts.filter((c) => c.id !== id);

    if (isAuthenticated && actor) {
      const previousContacts = contacts;
      queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], filtered);
      
      try {
        await saveMutation.mutateAsync(filtered);
      } catch (error) {
        queryClient.setQueryData(['emergencyContacts', identity?.getPrincipal().toString()], previousContacts);
        throw error;
      }
    } else {
      setLocalContacts(filtered);
    }
  };

  return {
    contacts,
    addContact,
    updateContact,
    removeContact,
    isLoading,
  };
}
