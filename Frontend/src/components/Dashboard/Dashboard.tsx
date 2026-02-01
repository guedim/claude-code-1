'use client';

/**
 * Dashboard Component
 * Muestra la lista de cursos después de autenticar
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Course as CourseComponent } from '@/components/Course/Course';
import { Course } from '@/types';
import styles from './Dashboard.module.scss';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function Dashboard() {
  const { getAuthHeader, logout, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar cursos');
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [getAuthHeader]);

  return (
    <AuthGuard>
      <div className={styles.page}>
        {/* Banner superior */}
        <header className={styles.banner}>
          <span className={styles.bannerRed}>PLATZI</span>
          <span className={styles.bannerBlack}>FLIX</span>
          <span className={styles.bannerSub}>CURSOS</span>
        </header>

        {/* User info & logout */}
        <div className={styles.userBar}>
          <span className={styles.userInfo}>
            Usuario: {user?.userId} ({user?.email})
          </span>
          <button onClick={logout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>

        {/* Nombres laterales */}
        <div className={styles.verticalLeft}>PLATZI</div>
        <div className={styles.verticalRight}>FLIX</div>

        {/* Grid de cursos */}
        <main className={styles.main}>
          {loading && (
            <div className={styles.loading}>Cargando cursos...</div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          {!loading && !error && (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <Link href={`/course/${course.slug}`} key={course.id}>
                  <CourseComponent
                    id={course.id}
                    name={course.name}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    average_rating={course.average_rating}
                    total_ratings={course.total_ratings}
                  />
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* Fondo de cuadrícula */}
        <div className={styles.gridBg}></div>
      </div>
    </AuthGuard>
  );
}
