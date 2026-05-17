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
import { RSVPGroup, RSVPStatus, Guest, GuestType } from '../models/rsvp.model';

@Injectable({
  providedIn: 'root'
})
export class RSVPService {
  private firestore = inject(Firestore);
  
  // Estado reativo do grupo atual
  currentGroup = signal<RSVPGroup | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

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
