import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/constants/colors';
import { HeatmapData, NeighborhoodStats } from '@/types';
import { votersService } from '@/services/voters.service';
import { MapPin, Users, AlertCircle, RefreshCw } from 'lucide-react-native';

// Importação condicional do WebView para evitar erros em web
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    // WebView não disponível nesta plataforma
  }
}

interface HeatMapProps {
  height?: number;
}

import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function HeatMap({ height = 300 }: HeatMapProps) {
  const { user } = useAuth();
  const { voters } = useData();

  // Admin não tem eleitores vinculados diretamente, então não exibe o mapa
  if (user?.role === 'admin') {
    return null;
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [neighborhoodStats, setNeighborhoodStats] = useState<NeighborhoodStats[]>([]);
  const [syncResult, setSyncResult] = useState<{ processed: number; success: number; failed: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('\n========== HEATMAP DEBUG ==========');
      console.log('[HeatMap] Plataforma:', Platform.OS);
      console.log('[HeatMap] Iniciando carregamento...');

      const [heatmap, stats] = await Promise.all([
        votersService.getHeatmapData(),
        votersService.getStatsByNeighborhood(),
      ]);

      console.log('[HeatMap] Resposta do servidor:');
      console.log('  - Total de eleitores:', heatmap?.totalVoters ?? 'N/A');
      console.log('  - Com localização:', heatmap?.votersWithLocation ?? 'N/A');
      console.log('  - Pontos no mapa:', heatmap?.points?.length ?? 0);
      console.log('  - Centro definido:', heatmap?.center ? `(${heatmap.center.latitude}, ${heatmap.center.longitude})` : 'Não');
      console.log('  - Bairros:', stats?.neighborhoods?.length ?? 0);
      console.log('====================================\n');

      setHeatmapData(heatmap);

      const neighborhoods = stats?.neighborhoods || [];
      setNeighborhoodStats(neighborhoods.slice(0, 5));
    } catch (err: any) {
      console.log('\n========== HEATMAP ERRO ==========');
      console.log('[HeatMap] Erro:', err?.message || 'Erro desconhecido');
      console.log('[HeatMap] Detalhes:', err?.response?.data || 'Sem detalhes');
      console.log('[HeatMap] Status HTTP:', err?.response?.status || 'N/A');
      console.log('===================================\n');
      setError(`Não foi possível carregar os dados do mapa: ${err?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Gera o HTML do mapa usando Leaflet (gratuito)
  const generateMapHtml = () => {
    if (!heatmapData || !heatmapData.center) {
      return '';
    }

    const { points, center } = heatmapData;
    const pointsJson = JSON.stringify(points);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            var map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([${center.latitude}, ${center.longitude}], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);

            var points = ${pointsJson};

            if (points.length > 0) {
              var heatData = points.map(function(p) {
                return [p.latitude, p.longitude, p.weight || 1];
              });

              var heat = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                  0.0: '#00ff00',
                  0.3: '#ffff00',
                  0.6: '#ff8000',
                  1.0: '#ff0000'
                }
              }).addTo(map);

              // Ajustar zoom para mostrar todos os pontos
              if (points.length > 1) {
                var bounds = L.latLngBounds(points.map(function(p) {
                  return [p.latitude, p.longitude];
                }));
                map.fitBounds(bounds, { padding: [20, 20] });
              }
            }
          } catch(e) {
            document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Erro ao carregar mapa: ' + e.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <AlertCircle color={Colors.light.error} size={32} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }



  const syncAddresses = async () => {
    try {
      setLoading(true);
      setSyncResult(null);
      setError(null);
      console.log('[HeatMap] Sincronizando endereços...');
      const result = await votersService.geocodePendingVoters(50);
      console.log('[HeatMap] Geocodificação:', result);
      setSyncResult(result);
      await loadData();
    } catch (err: any) {
      console.log('[HeatMap] Erro sync:', err?.message);
      setError(`Erro ao sincronizar endereços: ${err?.message || 'Erro desconhecido'}`);
      setLoading(false);
    }
  };

  const hasNoData = !heatmapData || !heatmapData.points || heatmapData.points.length === 0;

  if (hasNoData) {
    return (
      <View style={[styles.container, { height }]}>
        <MapPin color={Colors.light.textSecondary} size={32} />
        <Text style={styles.emptyText}>Nenhum eleitor com localização</Text>
        <Text style={styles.emptySubtext}>
          Cadastre eleitores com endereço para ver o mapa de calor
        </Text>

        {/* Info de debug */}
        <Text style={styles.debugText}>
          Total: {heatmapData?.totalVoters || 0} | Com localização: {heatmapData?.votersWithLocation || 0}
        </Text>

        {syncResult && (
          <View style={styles.syncResult}>
            <Text style={styles.syncResultText}>
              Processados: {syncResult.processed} | Sucesso: {syncResult.success} | Falhas: {syncResult.failed}
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={syncAddresses}
          >
            <Text style={styles.syncButtonText}>Sincronizar Endereços</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncButton, styles.reloadButton]}
            onPress={loadData}
          >
            <RefreshCw color="#fff" size={16} />
            <Text style={styles.syncButtonText}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          srcDoc={generateMapHtml()}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
        />
      );
    }

    if (WebView) {
      return (
        <WebView
          source={{ html: generateMapHtml() }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      );
    }

    // Fallback se WebView não estiver disponível
    return (
      <View style={[styles.container, { height: '100%' }]}>
        <MapPin color={Colors.light.primary} size={32} />
        <Text style={styles.emptyText}>Mapa disponível na versão web</Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Mapa */}
      <View style={[styles.mapContainer, { height }]}>
        {renderMap()}
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
          <Text style={styles.legendText}>Alta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff8000' }]} />
          <Text style={styles.legendText}>Média</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffff00' }]} />
          <Text style={styles.legendText}>Baixa</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#00ff00' }]} />
          <Text style={styles.legendText}>Mínima</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Users color={Colors.light.primary} size={16} />
          <Text style={styles.statValue}>{heatmapData.votersWithLocation}</Text>
          <Text style={styles.statLabel}>Com localização</Text>
        </View>
        <View style={styles.statItem}>
          <MapPin color={Colors.light.textSecondary} size={16} />
          <Text style={styles.statValue}>{heatmapData.totalVoters - heatmapData.votersWithLocation}</Text>
          <Text style={styles.statLabel}>Sem localização</Text>
        </View>
      </View>

      {/* Top Bairros */}
      {neighborhoodStats.length > 0 && (
        <View style={styles.neighborhoodsContainer}>
          <Text style={styles.neighborhoodsTitle}>Top Bairros</Text>
          {neighborhoodStats.map((neighborhood, index) => (
            <View key={neighborhood.name} style={styles.neighborhoodItem}>
              <View style={styles.neighborhoodRank}>
                <Text style={styles.neighborhoodRankText}>{index + 1}</Text>
              </View>
              <View style={styles.neighborhoodInfo}>
                <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
                <View style={styles.neighborhoodBar}>
                  <View
                    style={[
                      styles.neighborhoodBarFill,
                      { width: `${neighborhood.percentage}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.neighborhoodCount}>
                <Text style={styles.neighborhoodCountText}>{neighborhood.count}</Text>
                <Text style={styles.neighborhoodPercentText}>{neighborhood.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.card,
  },
  webview: {
    flex: 1,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.error,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  neighborhoodsContainer: {
    marginTop: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  neighborhoodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  neighborhoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  neighborhoodRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neighborhoodRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  neighborhoodInfo: {
    flex: 1,
  },
  neighborhoodName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  neighborhoodBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  neighborhoodBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  neighborhoodCount: {
    alignItems: 'flex-end',
  },
  neighborhoodCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  neighborhoodPercentText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  syncButton: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncResult: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
  },
  syncResultText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  reloadButton: {
    backgroundColor: Colors.light.textSecondary,
  },
});
