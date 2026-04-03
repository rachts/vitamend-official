import type {
  DatabaseAdapter,
  Donation,
  DonationInput,
  Medicine,
  Volunteer,
  VolunteerInput,
  Profile,
  DbResult,
  InitResult,
} from "../types"

async function getDb() {
  const { getFirestoreDb } = await import("@/firebase/config")
  return await getFirestoreDb()
}

async function getStorage() {
  const { getFirebaseStorage } = await import("@/firebase/config")
  return await getFirebaseStorage()
}

export const firebaseAdapter: DatabaseAdapter = {
  async initDatabase(): Promise<InitResult> {
    try {
      const db = await getDb()
      const { doc, getDoc, setDoc, Timestamp } = await import("firebase/firestore")

      // Check if already initialized by looking for _meta/initialized document
      const metaRef = doc(db, "_meta", "initialized")
      const metaSnap = await getDoc(metaRef)

      if (metaSnap.exists()) {
        return {
          success: true,
          message: "Database is already initialized.",
          alreadyInitialized: true,
        }
      }

      // Create initial collections by adding placeholder documents
      // Firebase creates collections implicitly when documents are added
      const { collection, addDoc, deleteDoc } = await import("firebase/firestore")

      // Create placeholder docs to initialize collections, then delete them
      const collectionsToInit = ["donations", "medicines", "volunteers", "profiles"]

      for (const collName of collectionsToInit) {
        const placeholderRef = await addDoc(collection(db, collName), {
          _placeholder: true,
          created_at: Timestamp.now(),
        })
        // Delete the placeholder
        await deleteDoc(placeholderRef)
      }

      // Mark as initialized
      await setDoc(metaRef, {
        initialized: true,
        initialized_at: Timestamp.now(),
        collections: collectionsToInit,
      })

      return {
        success: true,
        message: "Firebase collections initialized successfully!",
        alreadyInitialized: false,
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to initialize Firebase: ${error.message}`,
      }
    }
  },

  // Donations
  async submitDonation(data: DonationInput, imageUrls: string[] = []): Promise<DbResult<{ id: string }>> {
    try {
      const db = await getDb()
      const { collection, addDoc, Timestamp } = await import("firebase/firestore")

      const docRef = await addDoc(collection(db, "donations"), {
        medicine_name: data.medicineName,
        brand: data.brand,
        generic_name: data.genericName || null,
        dosage: data.dosage,
        quantity: data.quantity,
        expiry_date: data.expiryDate,
        condition: data.condition,
        category: data.category,
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        donor_address: data.donorAddress,
        notes: data.notes || null,
        image_urls: imageUrls,
        status: "pending",
        verified: false,
        created_at: Timestamp.now(),
      })

      return {
        success: true,
        data: { id: docRef.id },
        message: "Donation submitted successfully!",
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getDonations(): Promise<Donation[]> {
    try {
      const db = await getDb()
      const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
      const q = query(collection(db, "donations"), orderBy("created_at", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Donation[]
    } catch (error) {
      console.error("Error fetching donations:", error)
      return []
    }
  },

  async getDonationById(id: string): Promise<Donation | null> {
    try {
      const db = await getDb()
      const { doc, getDoc } = await import("firebase/firestore")
      const docSnap = await getDoc(doc(db, "donations", id))

      if (!docSnap.exists()) return null

      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Donation
    } catch {
      return null
    }
  },

  async updateDonationStatus(id: string, status: Donation["status"]): Promise<DbResult<void>> {
    try {
      const db = await getDb()
      const { doc, updateDoc } = await import("firebase/firestore")
      await updateDoc(doc(db, "donations", id), { status })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    try {
      const db = await getDb()
      const { collection, getDocs, query, where, orderBy } = await import("firebase/firestore")
      const q = query(collection(db, "medicines"), where("available", "==", true), orderBy("created_at", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Medicine[]
    } catch (error) {
      console.error("Error fetching medicines:", error)
      return []
    }
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const db = await getDb()
      const { doc, getDoc } = await import("firebase/firestore")
      const docSnap = await getDoc(doc(db, "medicines", id))

      if (!docSnap.exists()) return null

      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Medicine
    } catch {
      return null
    }
  },

  // Volunteers
  async submitVolunteer(data: VolunteerInput): Promise<DbResult<{ id: string }>> {
    try {
      const db = await getDb()
      const { collection, addDoc, Timestamp } = await import("firebase/firestore")

      const docRef = await addDoc(collection(db, "volunteers"), {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date_of_birth: data.dateOfBirth || null,
        occupation: data.occupation || null,
        experience: data.experience || null,
        availability: data.availability || null,
        role: data.role || null,
        motivation: data.motivation || null,
        emergency_contact: data.emergencyContact || null,
        emergency_phone: data.emergencyPhone || null,
        has_transport: data.hasTransport || false,
        can_lift: data.canLift || false,
        medical_conditions: data.medicalConditions || null,
        references: data.references || null,
        status: "pending",
        created_at: Timestamp.now(),
      })

      return {
        success: true,
        data: { id: docRef.id },
        message: "Application submitted successfully!",
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getVolunteers(): Promise<Volunteer[]> {
    try {
      const db = await getDb()
      const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
      const q = query(collection(db, "volunteers"), orderBy("created_at", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Volunteer[]
    } catch (error) {
      console.error("Error fetching volunteers:", error)
      return []
    }
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const db = await getDb()
      const { doc, getDoc } = await import("firebase/firestore")
      const docSnap = await getDoc(doc(db, "profiles", userId))

      if (!docSnap.exists()) return null

      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Profile
    } catch {
      return null
    }
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<DbResult<void>> {
    try {
      const db = await getDb()
      const { doc, setDoc, Timestamp } = await import("firebase/firestore")
      await setDoc(doc(db, "profiles", profile.id), { ...profile, updated_at: Timestamp.now() }, { merge: true })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Storage
  async uploadImage(file: File, folder = "donations"): Promise<string | null> {
    try {
      const storage = await getStorage()
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  },

  async uploadMultipleImages(files: File[], folder = "donations"): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results.filter((url): url is string => url !== null)
  },

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const storage = await getStorage()
      const { ref, deleteObject } = await import("firebase/storage")
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
      return true
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  },
}
