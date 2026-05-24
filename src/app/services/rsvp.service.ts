import { inject, Injectable, signal } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  or
} from '@angular/fire/firestore';
import { RSVPGroup, RSVPStatus, Guest, GuestType, EventConfig } from '../models/rsvp.model';

@Injectable({
  providedIn: 'root'
})
export class RSVPService {
  private firestore = inject(Firestore);
  
  // Estado reativo
  currentGroup = signal<RSVPGroup | null>(null);
  eventConfig = signal<EventConfig | null>(null);
  showLocationModal = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Busca as configurações do evento
   */
  async getEventConfig(): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'config/event');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.eventConfig.set(docSnap.data() as EventConfig);
      }
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    }
  }

  /**
   * Salva as configurações do evento
   */
  async saveEventConfig(config: EventConfig): Promise<void> {
    this.loading.set(true);
    try {
      const docRef = doc(this.firestore, 'config/event');
      await updateDoc(docRef, { ...config });
      this.eventConfig.set(config);
    } catch (e) {
      // Se o documento não existir, updateDoc falha. Tentamos criar.
      try {
        const { setDoc } = await import('@angular/fire/firestore');
        await setDoc(doc(this.firestore, 'config/event'), config);
        this.eventConfig.set(config);
      } catch (err) {
        this.error.set('Erro ao salvar configurações do evento.');
        throw err;
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Busca um grupo pelo ID único (Link Direto)
   */
  async getGroupById(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const docRef = doc(this.firestore, `groups/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.currentGroup.set({ id: docSnap.id, ...docSnap.data() } as RSVPGroup);
      } else {
        this.error.set('Convite não encontrado.');
      }
    } catch (e) {
      this.error.set('Erro ao carregar o convite.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Busca um grupo pelo nome do titular ou telefone
   */
  async searchGroup(term: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const groupsRef = collection(this.firestore, 'groups');
      
      // Busca por nome exato ou telefone exato
      // Nota: Firestore or() requer uma configuração específica dependendo da versão, 
      // mas vamos tentar a abordagem mais compatível primeiro.
      const q = query(
        groupsRef, 
        or(
          where('titularName', '==', term),
          where('phone', '==', term)
        )
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        this.currentGroup.set({ id: docSnap.id, ...docSnap.data() } as RSVPGroup);
      } else {
        this.error.set('Nenhum convidado encontrado com este nome ou telefone.');
      }
    } catch (e) {
      console.error('Erro na busca:', e);
      this.error.set('Erro na busca. Tente digitar o nome exatamente como no convite.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Salva as confirmações do grupo
   */
  async confirmRSVP(group: RSVPGroup): Promise<void> {
    if (!group.id) return;
    
    this.loading.set(true);
    try {
      const docRef = doc(this.firestore, `groups/${group.id}`);
      await updateDoc(docRef, {
        preRegisteredGuests: group.preRegisteredGuests,
        extraGuests: group.extraGuests
      });
    } catch (e) {
      this.error.set('Erro ao salvar confirmação.');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }

  reset(): void {
    this.currentGroup.set(null);
    this.error.set(null);
  }
}
